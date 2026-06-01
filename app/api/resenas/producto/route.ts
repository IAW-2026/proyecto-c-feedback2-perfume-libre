import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TipoResena, EstadoResena } from "@prisma/client";
import { verificarCompra } from "@/lib/services/orders";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId: id_usuario } = await auth();

    if (!id_usuario) {
      return NextResponse.json(
        { estado: "error", mensaje: "No autorizado. Debe iniciar sesión." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id_producto, puntuacion, comentario, id_orden } = body;

    // Validación básica
    if (!id_producto || !puntuacion || !id_orden) {
      return NextResponse.json(
        { estado: "error", mensaje: "Faltan campos obligatorios (id_orden, id_producto, puntuacion)" },
        { status: 400 }
      );
    }

    if (puntuacion < 1 || puntuacion > 5) {
      return NextResponse.json(
        { estado: "error", mensaje: "La puntuación debe estar entre 1 y 5" },
        { status: 400 }
      );
    }

    // Regla de negocio: Si puntaje < 3, comentario obligatorio
    if (puntuacion < 3 && (!comentario || comentario.trim() === "")) {
      return NextResponse.json(
        { estado: "error", mensaje: "El comentario es obligatorio para calificaciones menores a 3 estrellas" },
        { status: 400 }
      );
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
