import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MotivoReporte } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_resena, motivo, id_denunciante } = body;

    if (!id_resena || !motivo || !id_denunciante) {
      return NextResponse.json(
        { estado: "error", mensaje: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    if (!Object.values(MotivoReporte).includes(motivo)) {
      return NextResponse.json(
        { estado: "error", mensaje: "Motivo de reporte inválido" },
        { status: 400 }
      );
    }

    // Verificar que la reseña exista
    const resena = await db.resena.findUnique({
      where: { idResena: id_resena }
    });

    if (!resena) {
      return NextResponse.json(
        { estado: "error", mensaje: "La reseña no existe" },
        { status: 404 }
      );
    }

    const nuevoReporte = await db.reporteResena.create({
      data: {
        idResena: id_resena,
        motivo: motivo as MotivoReporte,
        idDenunciante: id_denunciante,
      },
    });

    return NextResponse.json(
      { estado: "success", mensaje: "Reporte enviado con éxito", id_reporte: nuevoReporte.idReporte },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando reporte:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
