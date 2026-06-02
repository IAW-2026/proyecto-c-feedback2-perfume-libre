import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { MotivoReporte } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { estado: "error", mensaje: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const { idResena, motivo, archivos } = await req.json();

    if (!idResena || !motivo) {
      return NextResponse.json(
        { estado: "error", mensaje: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    if (!Object.values(MotivoReporte).includes(motivo)) {
      return NextResponse.json(
        { estado: "error", mensaje: "Motivo inválido" },
        { status: 400 }
      );
    }

    // Crear el reporte
    const reporte = await db.reporteResena.create({
      data: {
        idResena,
        motivo,
        idDenunciante: userId,
        archivos: archivos && archivos.length > 0 ? {
          create: archivos.map((url: string) => ({ url }))
        } : undefined
      }
    });

    return NextResponse.json({
      estado: "success",
      mensaje: "Reporte enviado con éxito",
      reporte
    });

  } catch (error) {
    console.error("Error creando reporte:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
