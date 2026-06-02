import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { DecisionModeracion, EstadoResena } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ estado: "error", mensaje: "Usuario no autenticado" }, { status: 401 });
    }

    const user = await currentUser();
    const role = user?.publicMetadata?.role as string | undefined;

    if (role !== "admin" && role !== "moderator" && role !== "moderador") {
      return NextResponse.json({ estado: "error", mensaje: "No autorizado" }, { status: 403 });
    }

    const { idReporte, decision, motivoAdmin } = await req.json();

    if (!idReporte || !decision) {
      return NextResponse.json({ estado: "error", mensaje: "Faltan datos obligatorios" }, { status: 400 });
    }

    if (!Object.values(DecisionModeracion).includes(decision)) {
      return NextResponse.json({ estado: "error", mensaje: "Decisión inválida" }, { status: 400 });
    }

    // Usar transacción para asegurar atomicidad
    await db.$transaction(async (tx) => {
      // Crear el registro de moderación
      await tx.moderacionResena.create({
        data: {
          idReporte,
          decision,
          idModerador: userId,
          motivoAdmin
        }
      });

      // Obtener el id de la reseña desde el reporte
      const reporte = await tx.reporteResena.findUnique({
        where: { idReporte }
      });

      if (reporte) {
        // Actualizar el estado de la reseña
        let nuevoEstado: EstadoResena = EstadoResena.PUBLICA;
        if (decision === DecisionModeracion.OCULTAR) nuevoEstado = EstadoResena.OCULTA;
        if (decision === DecisionModeracion.ELIMINAR) nuevoEstado = EstadoResena.ELIMINADA;

        if (nuevoEstado !== EstadoResena.PUBLICA) {
          await tx.resena.update({
            where: { idResena: reporte.idResena },
            data: { estado: nuevoEstado }
          });
        }
      }
    });

    return NextResponse.json({
      estado: "success",
      mensaje: "Decisión registrada exitosamente"
    });
  } catch (error) {
    console.error("Error moderando reporte:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
