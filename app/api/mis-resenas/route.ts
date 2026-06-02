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

    // Buscamos todas las reseñas creadas por este usuario (comprador)
    const misResenas = await db.resena.findMany({
      where: {
        idComprador: userId,
      },
      include: {
        imagenes: true
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      estado: "success",
      resenas: misResenas
    });

  } catch (error) {
    console.error("Error obteniendo mis reseñas:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
