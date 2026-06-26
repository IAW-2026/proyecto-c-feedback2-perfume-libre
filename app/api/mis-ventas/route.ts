export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { TipoResena } from "@prisma/client";
import { MOCKED_ORDERS_DB } from "@/lib/services/orders";

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
    const pageSize = 5;

    // Buscamos todas las reseñas que están ligadas al ID de este vendedor
    // La BBDD separa reseña de PRODUCTO y de VENDEDOR. Si queremos "reseñas a mis productos",
    // necesitamos las reseñas de productos que este usuario VENDIÓ.
    // Como las órdenes mockeadas tienen la relación (y no tenemos tabla de productos), 
    // buscaremos las órdenes donde este seller vendió algo, y extraeremos los id_producto.
    const misOrdenes = MOCKED_ORDERS_DB.filter(o => o.id_vendedor === userId);
    
    // De las órdenes sacamos los id_producto únicos que él vende
    const misProductos = Array.from(new Set(misOrdenes.flatMap(o => o.items.map(i => i.id_producto))));

    // Buscamos reseñas tipo PRODUCTO para esos id_producto
    const resenasProducto = await db.resena.findMany({
      where: {
        idProducto: { in: misProductos },
        tipoResena: TipoResena.PRODUCTO,
      },
      include: { imagenes: true }
    });

    // Buscamos reseñas tipo VENDEDOR hacia este vendedor (para combinar o mostrar)
    const resenasVendedor = await db.resena.findMany({
      where: {
        idVendedor: userId,
        tipoResena: TipoResena.VENDEDOR,
      },
      include: { imagenes: true }
    });

    // Agrupamos por idOrden
    const bundles: Record<string, any> = {};

    [...resenasProducto, ...resenasVendedor].forEach(r => {
      if (!bundles[r.idOrden]) {
        bundles[r.idOrden] = { idOrden: r.idOrden, producto: null, vendedor: null };
      }
      if (r.tipoResena === TipoResena.PRODUCTO) {
        bundles[r.idOrden].producto = r;
      } else {
        bundles[r.idOrden].vendedor = r;
      }
    });

    // Mapear con datos de producto
    const combinadas = Object.values(bundles).map(bundle => {
      // Intentar encontrar el item mockeado para sacar la metadata del producto
      // Usamos la reseña de producto si existe, o la de vendedor como fallback, aunque la de vendedor
      // no siempre tiene idProducto, por eso filtramos misOrdenes
      const idProductoAUsar = bundle.producto?.idProducto;
      let item = MOCKED_ORDERS_DB.flatMap(o => o.items).find(i => i.id_producto === idProductoAUsar);
      
      // Si no encontramos, buscamos en la orden original mockeada usando idOrden
      if (!item) {
        const ordenMockeada = MOCKED_ORDERS_DB.find(o => o.id_orden === bundle.idOrden);
        item = ordenMockeada?.items[0];
      }

      return {
        idResenaBundle: bundle.idOrden,
        productoInfo: item || { nombre_producto: "Producto Desconocido", imagen: "https://placehold.co/150" },
        resenaProducto: bundle.producto,
        resenaVendedor: bundle.vendedor
      }
    });

    const totalCount = combinadas.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const skip = (page - 1) * pageSize;
    const paginatedItems = combinadas.slice(skip, skip + pageSize);

    return NextResponse.json({
      estado: "success",
      resenas: paginatedItems,
      totalPages,
      currentPage: page
    });

  } catch (error) {
    console.error("Error obteniendo mis ventas:", error);
    return NextResponse.json(
      { estado: "error", mensaje: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

