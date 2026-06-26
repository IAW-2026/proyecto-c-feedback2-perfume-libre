export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TipoResena, EstadoResena } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id_vendedor: string }> }
) {
  try {
    const { id_vendedor } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const where = {
      idVendedor: id_vendedor,
      tipoResena: TipoResena.VENDEDOR,
      estado: { not: EstadoResena.ELIMINADA },
    };

    const [total, items, metricas] = await Promise.all([
      db.resena.count({ where }),
      db.resena.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.metricasVendedor.findUnique({
        where: { idVendedor: id_vendedor },
      }),
    ]);

    // Limpia respuesta de BBDD
    const safeItems = items.map(item => ({
      id_resena: item.idResena,
      id_comprador: item.idComprador,
      calificacion: item.calificacion,
      comentario: item.comentario,
      fecha: item.createdAt,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      promedio_vendedor: metricas?.promedioCalificacion || 0,
      total,
      page,
      totalPages,
      items: safeItems,
    });
  } catch (error) {
    console.error("Error obteniendo reseñas del vendedor:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
