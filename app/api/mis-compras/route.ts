export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { obtenerOrdenesDelComprador } from "@/lib/services/orders";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { TipoResena } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    const { searchParams } = new URL(req.url);
    const testUserId = searchParams.get("userId");
    const id_comprador = testUserId || userId;

    if (!id_comprador) {
      return NextResponse.json(
        { estado: "error", mensaje: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 5;
    const status = searchParams.get("status") || "pendientes"; // 'pendientes' | 'completadas'

    // Obtener todas las órdenes del comprador (usualmente mockeadas o de API externa)
    const ordenes = await obtenerOrdenesDelComprador(id_comprador);

    // Obtener todas las reseñas del comprador
    const resenas = await db.resena.findMany({
      where: {
        idComprador: id_comprador,
      },
      include: {
        imagenes: true
      }
    });

    const resenasProducto = resenas.filter(r => r.tipoResena === TipoResena.PRODUCTO);
    const resenasVendedor = resenas.filter(r => r.tipoResena === TipoResena.VENDEDOR);

    const reviewedProductIds = new Set(resenasProducto.map(r => r.idProducto));

    // Desglosar en items individuales e identificar si están reseñados
    let itemsFiltrados: any[] = [];

    ordenes.forEach(orden => {
      orden.items.forEach(item => {
        const isReviewed = reviewedProductIds.has(item.id_producto);
        
        if (status === "pendientes" && !isReviewed) {
          itemsFiltrados.push({ orden, item });
        } else if (status === "completadas" && isReviewed) {
          const resenaProductoData = resenasProducto.find(r => r.idProducto === item.id_producto);
          const resenaVendedorData = resenasVendedor.find(r => r.idOrden === orden.id_orden);
          itemsFiltrados.push({ 
            orden, 
            item, 
            calificacion: resenaProductoData?.calificacion || 0,
            resenaProducto: resenaProductoData,
            resenaVendedor: resenaVendedorData
          });
        }
      });
    });

    const totalCount = itemsFiltrados.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const skip = (page - 1) * pageSize;
    
    const paginatedItems = itemsFiltrados.slice(skip, skip + pageSize);

    return NextResponse.json({
      estado: "success",
      items: paginatedItems,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error("Error obteniendo compras:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
