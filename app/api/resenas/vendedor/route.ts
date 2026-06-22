import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TipoResena, EstadoResena } from "@prisma/client";
import { verificarCompra } from "@/lib/services/orders";
import { auth } from "@clerk/nextjs/server";
import { crearResenaSchema, actualizarResenaSchema } from "@/lib/validations";

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
    
    const validacion = crearResenaSchema.safeParse(body);
    if (!validacion.success) {
      return NextResponse.json(
        { estado: "error", mensaje: validacion.error.issues[0].message, detalles: validacion.error.issues },
        { status: 400 }
      );
    }

    const { id_vendedor, puntuacion, comentario, id_orden } = validacion.data;

    if (!id_vendedor) {
      return NextResponse.json({ estado: "error", mensaje: "id_vendedor es requerido para esta ruta" }, { status: 400 });
    }

    const compraVerificada = await verificarCompra(id_orden, id_usuario, undefined, id_vendedor);
    if (!compraVerificada) {
      return NextResponse.json(
        { estado: "error", mensaje: "No se encontró una orden válida que compruebe una compra a este vendedor" },
        { status: 403 }
      );
    }

    const nuevaResena = await db.resena.create({
      data: {
        idVendedor: id_vendedor,
        idComprador: id_usuario,
        idOrden: id_orden,
        tipoResena: TipoResena.VENDEDOR,
        calificacion: puntuacion,
        comentario: comentario || null,
        estado: EstadoResena.PUBLICA,
      },
    });

    await actualizarMetricasVendedor(id_vendedor);

    return NextResponse.json(
      { estado: "success", mensaje: "Reseña de vendedor creada con éxito", id_reseña: nuevaResena.idResena },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creando reseña de vendedor:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { estado: "error", mensaje: "Ya existe una reseña de este usuario para esta orden y vendedor" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

async function actualizarMetricasVendedor(idVendedor: string) {
  const resenas = await db.resena.findMany({
    where: {
      idVendedor: idVendedor,
      tipoResena: TipoResena.VENDEDOR,
      estado: { not: EstadoResena.ELIMINADA },
    },
    select: { calificacion: true },
  });

  const cantidad = resenas.length;
  let suma = 0;

  for (const resena of resenas) {
    suma += resena.calificacion;
  }

  const promedio = cantidad > 0 ? suma / cantidad : 0;

  await db.metricasVendedor.upsert({
    where: { idVendedor },
    update: {
      promedioCalificacion: promedio,
      cantidadResenas: cantidad,
    },
    create: {
      idVendedor,
      promedioCalificacion: promedio,
      cantidadResenas: cantidad,
    },
  });
}

export async function PUT(req: Request) {
  try {
    const { userId: id_usuario } = await auth();
    if (!id_usuario) return NextResponse.json({ estado: "error", mensaje: "No autorizado" }, { status: 401 });

    const body = await req.json();
    
    const validacion = actualizarResenaSchema.safeParse(body);
    if (!validacion.success) {
      return NextResponse.json(
        { estado: "error", mensaje: validacion.error.issues[0].message, detalles: validacion.error.issues },
        { status: 400 }
      );
    }

    const { id_resena, puntuacion, comentario } = validacion.data;

    const resenaExistente = await db.resena.findUnique({ where: { idResena: id_resena } });
    if (!resenaExistente || resenaExistente.idComprador !== id_usuario) {
      return NextResponse.json({ estado: "error", mensaje: "No encontrada o sin permisos" }, { status: 404 });
    }

    await db.resena.update({
      where: { idResena: id_resena },
      data: {
        calificacion: puntuacion,
        comentario: comentario || null,
      }
    });

    if (resenaExistente.idVendedor) {
      await actualizarMetricasVendedor(resenaExistente.idVendedor);
    }

    return NextResponse.json({ estado: "success", mensaje: "Reseña actualizada con éxito" });
  } catch (error) {
    console.error("Error actualizando reseña de vendedor:", error);
    return NextResponse.json({ estado: "error", mensaje: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId: id_usuario } = await auth();
    if (!id_usuario) return NextResponse.json({ estado: "error", mensaje: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id_resena = searchParams.get("id_resena");

    if (!id_resena) {
      return NextResponse.json({ estado: "error", mensaje: "Falta id_resena" }, { status: 400 });
    }

    const resenaExistente = await db.resena.findUnique({ where: { idResena: id_resena } });
    if (!resenaExistente || resenaExistente.idComprador !== id_usuario) {
      return NextResponse.json({ estado: "error", mensaje: "No encontrada o sin permisos" }, { status: 404 });
    }

    await db.resena.delete({ where: { idResena: id_resena } });

    if (resenaExistente.idVendedor) {
      await actualizarMetricasVendedor(resenaExistente.idVendedor);
    }

    return NextResponse.json({ estado: "success", mensaje: "Reseña eliminada con éxito" });
  } catch (error) {
    console.error("Error eliminando reseña de vendedor:", error);
    return NextResponse.json({ estado: "error", mensaje: "Error interno del servidor" }, { status: 500 });
  }
}
