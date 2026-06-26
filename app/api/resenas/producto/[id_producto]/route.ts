export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TipoResena, EstadoResena } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id_producto: string }> }
) {
  try {
    const { id_producto } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    // Solo devolver reseñas que no estén eliminadas
    const where = {
      idProducto: id_producto,
      tipoResena: TipoResena.PRODUCTO,
      estado: { not: EstadoResena.ELIMINADA },
    };

    const [total, items, metricas] = await Promise.all([
      db.resena.count({ where }),
      db.resena.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          imagenes: true,
        },
      }),
      db.metricasProducto.findUnique({
        where: { idProducto: id_producto },
      }),
    ]);

    // Limpiamos retorno de la BBDD para respuesta
    const safeItems = items.map(item => ({
      id_resena: item.idResena,
      id_comprador: item.idComprador,
      calificacion: item.calificacion,
      comentario: item.comentario,
      fecha: item.createdAt,
      imagenes: item.imagenes.map(img => img.url),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      promedio_producto: metricas?.promedioCalificacion || 0,
      total,
      page,
      totalPages,
      items: safeItems,
    });
  } catch (error) {
    console.error("Error obteniendo reseñas del producto:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
