import { NextResponse } from "next/server";
import { obtenerOrdenesDelComprador } from "@/lib/services/orders";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    // Intentar obtener el usuario de Clerk (si está autenticado)
    const { userId } = await auth();
    
    // Para pruebas, también permitimos pasar un userId por query
    const { searchParams } = new URL(req.url);
    const testUserId = searchParams.get("userId");

    const id_comprador = testUserId || userId;

    if (!id_comprador) {
      return NextResponse.json(
        { estado: "error", mensaje: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const ordenes = await obtenerOrdenesDelComprador(id_comprador);

    return NextResponse.json({
      estado: "success",
      ordenes
    });
  } catch (error) {
    console.error("Error obteniendo compras mockeadas:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
