"use client";

import { useEffect, useState } from "react";
import ReviewModal from "@/app/components/ReviewModal";
import ProductReviewCard from "./components/ProductReviewCard";
import Pagination from "@/app/components/Pagination";
import { Order, OrderItem, Resena } from "./types";

export default function DarResenasPage() {
  const [loadingPendientes, setLoadingPendientes] = useState(true);
  const [loadingCompletadas, setLoadingCompletadas] = useState(true);

  const [pendientes, setPendientes] = useState<{ orden: Order; item: OrderItem }[]>([]);
  const [completadas, setCompletadas] = useState<any[]>([]);

  const [pagePendientes, setPagePendientes] = useState(1);
  const [totalPagesPendientes, setTotalPagesPendientes] = useState(1);

  const [pageCompletadas, setPageCompletadas] = useState(1);
  const [totalPagesCompletadas, setTotalPagesCompletadas] = useState(1);

  const [selectedProduct, setSelectedProduct] = useState<{
    orden: Order;
    item: OrderItem;
  } | null>(null);
  
  const [existingReviews, setExistingReviews] = useState<{
    producto?: { idResena: string; calificacion: number; comentario: string | null; imagenes?: {idImagen: string, url: string}[] };
    vendedor?: { idResena: string; calificacion: number; comentario: string | null; };
  } | undefined>();

  const fetchPendientes = async (page: number) => {
    setLoadingPendientes(true);
    try {
      const res = await fetch(`/api/mis-compras?status=pendientes&page=${page}`);
      const data = await res.json();
      if (data.estado === "success") {
        setPendientes(data.items);
        setTotalPagesPendientes(data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPendientes(false);
    }
  };

  const fetchCompletadas = async (page: number) => {
    setLoadingCompletadas(true);
    try {
      const res = await fetch(`/api/mis-compras?status=completadas&page=${page}`);
      const data = await res.json();
      if (data.estado === "success") {
        setCompletadas(data.items);
        setTotalPagesCompletadas(data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCompletadas(false);
    }
  };

  useEffect(() => {
    fetchPendientes(pagePendientes);
  }, [pagePendientes]);

  useEffect(() => {
    fetchCompletadas(pageCompletadas);
  }, [pageCompletadas]);

  const handleReviewAdded = () => {
    setSelectedProduct(null);
    setExistingReviews(undefined);
    // Reload both current pages after review added
    fetchPendientes(pagePendientes);
    fetchCompletadas(pageCompletadas);
  };

  const openReviewModal = (orden: Order, item: OrderItem, itemData?: any) => {
    setSelectedProduct({ orden, item });
    
    if (itemData && (itemData.resenaProducto || itemData.resenaVendedor)) {
      const prodReview = itemData.resenaProducto;
      const sellerReview = itemData.resenaVendedor;

      setExistingReviews({
        producto: prodReview ? { idResena: prodReview.idResena, calificacion: prodReview.calificacion, comentario: prodReview.comentario, imagenes: prodReview.imagenes } : undefined,
        vendedor: sellerReview ? { idResena: sellerReview.idResena, calificacion: sellerReview.calificacion, comentario: sellerReview.comentario } : undefined,
      });
    } else {
      setExistingReviews(undefined);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-teal-700 pb-2">Dejar una reseña</h2>
      
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Productos sin reseñar</h3>
        <div className={loadingPendientes ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
          {pendientes.length > 0 ? (
            <>
              <div className="grid gap-4">
                {pendientes.map(({ orden, item }) => (
                  <ProductReviewCard
                    key={`${orden.id_orden}-${item.id_producto}`}
                    item={item}
                    sellerName={orden.nombre_vendedor}
                    onClick={() => openReviewModal(orden, item)}
                  />
                ))}
              </div>
              <Pagination 
                currentPage={pagePendientes} 
                totalPages={totalPagesPendientes} 
                onPageChange={setPagePendientes} 
                disabled={loadingPendientes}
              />
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded p-6 text-center text-gray-500">
              {loadingPendientes ? "Cargando compras pendientes..." : "No tienes productos pendientes por reseñar."}
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 mt-8">Mis reseñas</h3>
        <div className={loadingCompletadas ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
          {completadas.length > 0 ? (
            <>
              <div className="grid gap-4">
                {completadas.map((itemData) => (
                  <ProductReviewCard
                    key={`rev-${itemData.orden.id_orden}-${itemData.item.id_producto}`}
                    item={itemData.item}
                    sellerName={itemData.orden.nombre_vendedor}
                    calificacion={itemData.calificacion}
                    isReviewed={true}
                    onClick={() => openReviewModal(itemData.orden, itemData.item, itemData)}
                  />
                ))}
              </div>
              <Pagination 
                currentPage={pageCompletadas} 
                totalPages={totalPagesCompletadas} 
                onPageChange={setPageCompletadas} 
                disabled={loadingCompletadas}
              />
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded p-6 text-center text-gray-500">
              {loadingCompletadas ? "Cargando tus reseñas..." : "Aún no has dejado reseñas."}
            </div>
          )}
        </div>
      </section>

      {selectedProduct && (
        <ReviewModal 
          product={selectedProduct} 
          existingReviews={existingReviews}
          onClose={handleReviewAdded} 
        />
      )}
    </div>
  );
}

