export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { estado: "error", mensaje: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const whereClause = {
      idComprador: userId,
    };

    const [misResenas, totalCount] = await Promise.all([
      db.resena.findMany({
        where: whereClause,
        include: {
          imagenes: true
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize
      }),
      db.resena.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      estado: "success",
      resenas: misResenas,
      totalPages,
      currentPage: page
    });

  } catch (error) {
    console.error("Error obteniendo mis reseñas:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
