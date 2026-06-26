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

    const [metricas, resenas] = await Promise.all([
      db.metricasProducto.findUnique({
        where: { idProducto: id_producto },
      }),
      db.resena.findMany({
        where: {
          idProducto: id_producto,
          tipoResena: TipoResena.PRODUCTO,
          estado: { not: EstadoResena.ELIMINADA },
        },
        select: { calificacion: true },
      }),
    ]);

    // Calcular distribución de estrellas
    const distribucion_estrellas = {
      "1": 0, "2": 0, "3": 0, "4": 0, "5": 0,
    };

    resenas.forEach((r) => {
      const key = r.calificacion.toString() as keyof typeof distribucion_estrellas;
      if (distribucion_estrellas[key] !== undefined) {
        distribucion_estrellas[key]++;
      }
    });

    return NextResponse.json({
      promedio_producto: metricas?.promedioCalificacion || 0,
      cantidad_resenas: metricas?.cantidadResenas || 0,
      distribucion_estrellas,
    });
  } catch (error) {
    console.error("Error obteniendo resumen del producto:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
