import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { DecisionModeracion } from "@prisma/client";

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

    // Filtros por decisiones
    const decisionsParam = searchParams.get("decisions");
    let decisionsFilter: DecisionModeracion[] = [];
    if (decisionsParam) {
      decisionsFilter = decisionsParam.split(",") as DecisionModeracion[];
    } else {
      // Si no hay filtro, traer todos por defecto
      decisionsFilter = ["RECHAZAR", "OCULTAR", "ELIMINAR"];
    }

    const whereClause = {
      decision: {
        in: decisionsFilter
      }
    };

    // Consultamos directamente las moderaciones para poder ordenarlas por createdAt (más reciente primero)
    const [moderaciones, totalCount] = await Promise.all([
      db.moderacionResena.findMany({
        where: whereClause,
        include: {
          reporte: {
            include: {
              resena: true,
              archivos: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      }),
      db.moderacionResena.count({ where: whereClause })
    ]);

    // Obtener los nombres de los moderadores (opcional si es local, pero Clerk es más complejo)
    // Para resolver esto de forma eficiente y no llamar a la API de Clerk por cada moderador,
    // podríamos buscar en la tabla "UsuarioLocal" de Prisma usando idModerador.
    const modIds = [...new Set(moderaciones.map(m => m.idModerador))];
    const moderadoresInfo = await db.usuarioLocal.findMany({
      where: { clerkUserId: { in: modIds } }
    });
    
    const modMap = moderadoresInfo.reduce((acc, curr) => {
      acc[curr.clerkUserId] = curr.nombre;
      return acc;
    }, {} as Record<string, string>);

    // Formateamos la respuesta para que la raíz sea el reporte pero incluyendo la moderación.
    const reportes = moderaciones.map(mod => ({
      ...mod.reporte,
      moderacionActual: {
        idModeracion: mod.idModeracion,
        decision: mod.decision,
        idModerador: mod.idModerador,
        nombreModerador: modMap[mod.idModerador] || "Administrador",
        createdAt: mod.createdAt
      }
    }));

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      estado: "success",
      reportes,
      totalPages,
      currentPage: page,
      totalCount
    });
  } catch (error) {
    console.error("Error obteniendo historial de reportes:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
