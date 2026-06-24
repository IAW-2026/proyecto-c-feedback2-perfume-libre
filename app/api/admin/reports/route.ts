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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 5;
    const skip = (page - 1) * pageSize;

    const whereClause = {
      resena: {
        estado: EstadoResena.PUBLICA // Solo traer reportes de reseñas que aún están públicas
      },
      moderaciones: {
        none: {} // Solo traer reportes que NO han sido moderados aún
      }
    };

    const [reportes, totalCount] = await Promise.all([
      db.reporteResena.findMany({
        where: whereClause,
        include: {
          resena: true,
          archivos: true
        },
        orderBy: {
          createdAt: 'asc'
        },
        skip,
        take: pageSize
      }),
      db.reporteResena.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      estado: "success",
      reportes,
      totalPages,
      currentPage: page,
      totalCount
    });
  } catch (error) {
    console.error("Error obteniendo reportes:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
