import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { EstadoResena } from "@prisma/client";

export async function GET(req: Request) {
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

    const reportes = await db.reporteResena.findMany({
      where: {
        resena: {
          estado: EstadoResena.PUBLICA // Solo traer reportes de reseñas que aún están públicas
        }
      },
      include: {
        resena: true,
        archivos: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({
      estado: "success",
      reportes
    });
  } catch (error) {
    console.error("Error obteniendo reportes:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
