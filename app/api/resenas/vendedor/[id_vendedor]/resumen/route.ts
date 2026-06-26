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

    const [metricas, resenas] = await Promise.all([
      db.metricasVendedor.findUnique({
        where: { idVendedor: id_vendedor },
      }),
      db.resena.findMany({
        where: {
          idVendedor: id_vendedor,
          tipoResena: TipoResena.VENDEDOR,
          estado: { not: EstadoResena.ELIMINADA },
        },
        select: { calificacion: true },
      }),
    ]);

    const distribucion_estrellas = {
      "1": 0, "2": 0, "3": 0, "4": 0, "5": 0,
    };

    // Suma al diccionario cuantas reseñas de x extrellas hay
    resenas.forEach((r) => {
      const key = r.calificacion.toString() as keyof typeof distribucion_estrellas;
      if (distribucion_estrellas[key] !== undefined) {
        distribucion_estrellas[key]++;
      }
    });

    return NextResponse.json({
      promedio_vendedor: metricas?.promedioCalificacion || 0,
      cantidad_resenas: metricas?.cantidadResenas || 0,
      distribucion_estrellas,
    });
  } catch (error) {
    console.error("Error obteniendo resumen del vendedor:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
