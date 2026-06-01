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
    const { id_vendedor, puntuacion, comentario, id_orden } = body;

    if (!id_vendedor || !puntuacion || !id_orden) {
      return NextResponse.json(
        { estado: "error", mensaje: "Faltan campos obligatorios (id_orden, id_vendedor, puntuacion)" },
        { status: 400 }
      );
    }

    if (puntuacion < 1 || puntuacion > 5) {
      return NextResponse.json(
        { estado: "error", mensaje: "La puntuación debe estar entre 1 y 5" },
        { status: 400 }
      );
    }

    if (puntuacion < 3 && (!comentario || comentario.trim() === "")) {
      return NextResponse.json(
        { estado: "error", mensaje: "El comentario es obligatorio para calificaciones menores a 3 estrellas" },
        { status: 400 }
      );
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
