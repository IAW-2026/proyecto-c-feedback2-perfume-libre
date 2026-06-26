import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TipoResena, EstadoResena } from "@prisma/client";
import { verificarCompra } from "@/lib/services/orders";
import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { crearResenaSchema, actualizarResenaSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    const apiKey = req.headers.get('api_key');
    const isExternalApp = apiKey === process.env.FEEDBACK_API_KEY;

    const body = await req.json();
    let id_usuario = clerkUserId;

    if (!id_usuario && isExternalApp) {
      id_usuario = body.id_usuario;
    }

    if (!id_usuario) {
      return NextResponse.json(
        { estado: "error", mensaje: "No autorizado. Debe iniciar sesión o enviar id_usuario con api_key válida." },
        { status: 401 }
      );
    }
    
    const validacion = crearResenaSchema.safeParse(body);
    if (!validacion.success) {
      return NextResponse.json(
        { estado: "error", mensaje: validacion.error.issues[0].message, detalles: validacion.error.issues },
        { status: 400 }
      );
    }

    const { id_producto, puntuacion, comentario, id_orden, imagenes } = validacion.data;

    if (!id_producto) {
      return NextResponse.json({ estado: "error", mensaje: "id_producto es requerido para esta ruta" }, { status: 400 });
    }

    // Verificar usando el servicio de órdenes si realmente compró el producto
    const compraVerificada = await verificarCompra(id_orden, id_usuario, id_producto, undefined);
    if (!compraVerificada) {
      return NextResponse.json(
        { estado: "error", mensaje: "No se encontró una orden válida que compruebe la compra de este producto" },
        { status: 403 }
      );
    }

    // Crear la reseña
    const nuevaResena = await db.resena.create({
      data: {
        idProducto: id_producto,
        idComprador: id_usuario,
        idOrden: id_orden,
        tipoResena: TipoResena.PRODUCTO,
        calificacion: puntuacion,
        comentario: comentario || null,
        estado: EstadoResena.PUBLICA,
        ...(imagenes && imagenes.length > 0 && {
          imagenes: {
            create: imagenes.map((url: string) => ({ url }))
          }
        })
      },
    });

    // Actualizar métricas del producto
    await actualizarMetricasProducto(id_producto);

    return NextResponse.json(
      { estado: "success", mensaje: "Reseña creada con éxito", id_reseña: nuevaResena.idResena },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creando reseña de producto:", error);
    
    // Manejo de error de constraint unique
    if (error.code === 'P2002') {
      return NextResponse.json(
        { estado: "error", mensaje: "Ya existe una reseña de este usuario para esta orden y producto" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

async function actualizarMetricasProducto(idProducto: string) {
  // Obtener todas las reseñas públicas de este producto
  const resenas = await db.resena.findMany({
    where: {
      idProducto: idProducto,
      tipoResena: TipoResena.PRODUCTO,
      estado: { not: EstadoResena.ELIMINADA }, // Las ocultas sí cuentan según regla de negocio
    },
    select: { calificacion: true },
  });

  const cantidad = resenas.length;
  let suma = 0;

  for (const resena of resenas) {
    suma += resena.calificacion;
  }

  const promedio = cantidad > 0 ? suma / cantidad : 0;

  await db.metricasProducto.upsert({
    where: { idProducto },
    update: {
      promedioCalificacion: promedio,
      cantidadResenas: cantidad,
    },
    create: {
      idProducto,
      promedioCalificacion: promedio,
      cantidadResenas: cantidad,
    },
  });
}

export async function PUT(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    const apiKey = req.headers.get('api_key');
    const isExternalApp = apiKey === process.env.FEEDBACK_API_KEY;

    const body = await req.json();
    let id_usuario = clerkUserId;

    if (!id_usuario && isExternalApp) {
      id_usuario = body.id_usuario;
    }

    if (!id_usuario) return NextResponse.json({ estado: "error", mensaje: "No autorizado" }, { status: 401 });
    
    const validacion = actualizarResenaSchema.safeParse(body);
    if (!validacion.success) {
      return NextResponse.json(
        { estado: "error", mensaje: validacion.error.issues[0].message, detalles: validacion.error.issues },
        { status: 400 }
      );
    }

    const { id_resena, puntuacion, comentario, imagenes, imagenesEliminar } = validacion.data;

    // Verificar que la reseña exista y sea del usuario
    const resenaExistente = await db.resena.findUnique({ where: { idResena: id_resena } });
    if (!resenaExistente || resenaExistente.idComprador !== id_usuario) {
      return NextResponse.json({ estado: "error", mensaje: "No encontrada o sin permisos" }, { status: 404 });
    }

    // Actualizar
    await db.resena.update({
      where: { idResena: id_resena },
      data: {
        calificacion: puntuacion,
        comentario: comentario || null,
      }
    });

    // Manejar eliminación de imágenes
    if (imagenesEliminar && imagenesEliminar.length > 0) {
      try {
        await del(imagenesEliminar);
        await db.imagenResenaProducto.deleteMany({
          where: {
            idResena: id_resena,
            url: { in: imagenesEliminar }
          }
        });
      } catch (err) {
        console.error("Error al borrar imágenes de Vercel Blob:", err);
      }
    }

    // Manejar agregado de nuevas imágenes
    if (imagenes && imagenes.length > 0) {
      const nuevasImagenes = imagenes.map((url: string) => ({
        idResena: id_resena,
        url
      }));
      await db.imagenResenaProducto.createMany({
        data: nuevasImagenes
      });
    }

    if (resenaExistente.idProducto) {
      await actualizarMetricasProducto(resenaExistente.idProducto);
    }

    return NextResponse.json({ estado: "success", mensaje: "Reseña actualizada con éxito" });
  } catch (error) {
    console.error("Error actualizando reseña de producto:", error);
    return NextResponse.json({ estado: "error", mensaje: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    const apiKey = req.headers.get('api_key');
    const isExternalApp = apiKey === process.env.FEEDBACK_API_KEY;

    const { searchParams } = new URL(req.url);
    const id_resena = searchParams.get("id_resena");

    let id_usuario = clerkUserId;
    if (!id_usuario && isExternalApp) {
      id_usuario = searchParams.get("id_usuario");
    }

    if (!id_usuario) return NextResponse.json({ estado: "error", mensaje: "No autorizado" }, { status: 401 });

    if (!id_resena) {
      return NextResponse.json({ estado: "error", mensaje: "Falta id_resena" }, { status: 400 });
    }

    // Verificar que la reseña exista y sea del usuario
    const resenaExistente = await db.resena.findUnique({ 
      where: { idResena: id_resena },
      include: { imagenes: true }
    });
    if (!resenaExistente || resenaExistente.idComprador !== id_usuario) {
      return NextResponse.json({ estado: "error", mensaje: "No encontrada o sin permisos" }, { status: 404 });
    }

    if (resenaExistente.imagenes && resenaExistente.imagenes.length > 0) {
      try {
        const urlsABorrar = resenaExistente.imagenes.map(img => img.url);
        await del(urlsABorrar);
      } catch(e) {
        console.error("No se pudieron borrar las imagenes de vercel blob", e);
      }
    }

    // Borramos la reseña
    await db.resena.delete({ where: { idResena: id_resena } });

    if (resenaExistente.idProducto) {
      await actualizarMetricasProducto(resenaExistente.idProducto);
    }

    return NextResponse.json({ estado: "success", mensaje: "Reseña eliminada con éxito" });
  } catch (error) {
    console.error("Error eliminando reseña de producto:", error);
    return NextResponse.json({ estado: "error", mensaje: "Error interno del servidor" }, { status: 500 });
  }
}
