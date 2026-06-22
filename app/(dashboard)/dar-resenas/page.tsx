"use client";

import { useEffect, useState } from "react";
import ReviewModal from "@/app/components/ReviewModal";
import ProductReviewCard from "./components/ProductReviewCard";
import { Order, OrderItem, Resena } from "./types";

export default function DarResenasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [myReviews, setMyReviews] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<{
    orden: Order;
    item: OrderItem;
  } | null>(null);
  
  const [existingReviews, setExistingReviews] = useState<{
    producto?: { idResena: string; calificacion: number; comentario: string | null; imagenes?: {idImagen: string, url: string}[] };
    vendedor?: { idResena: string; calificacion: number; comentario: string | null; };
  } | undefined>();

  const fetchOrdersAndReviews = async () => {
    try {
      const [resOrders, resReviews] = await Promise.all([
        fetch("/api/mis-compras"),
        fetch("/api/mis-resenas")
      ]);
      const dataOrders = await resOrders.json();
      const dataReviews = await resReviews.json();
      
      if (dataOrders.estado === "success") {
        setOrders(dataOrders.ordenes);
      }
      if (dataReviews.estado === "success") {
        setMyReviews(dataReviews.resenas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndReviews();
  }, []);

  const handleReviewAdded = () => {
    setSelectedProduct(null);
    setExistingReviews(undefined);
    fetchOrdersAndReviews();
  };

  const openReviewModal = (orden: Order, item: OrderItem) => {
    const prodReview = myReviews.find(r => r.idProducto === item.id_producto && r.tipoResena === "PRODUCTO");
    const sellerReview = myReviews.find(r => r.idOrden === orden.id_orden && r.tipoResena === "VENDEDOR");

    setSelectedProduct({ orden, item });
    
    if (prodReview || sellerReview) {
      setExistingReviews({
        producto: prodReview ? { idResena: prodReview.idResena, calificacion: prodReview.calificacion, comentario: prodReview.comentario, imagenes: prodReview.imagenes } : undefined,
        vendedor: sellerReview ? { idResena: sellerReview.idResena, calificacion: sellerReview.calificacion, comentario: sellerReview.comentario } : undefined,
      });
    } else {
      setExistingReviews(undefined);
    }
  };

  if (loading) {
    return <div className="text-teal-700 text-center py-10">Cargando compras...</div>;
  }

  const reviewedProductIds = new Set(
    myReviews.filter(r => r.tipoResena === "PRODUCTO").map(r => r.idProducto)
  );

  const sinResenar: { orden: Order; item: OrderItem }[] = [];
  const misResenasItems: { orden: Order; item: OrderItem; calificacion: number }[] = [];

  orders.forEach(orden => {
    orden.items.forEach(item => {
      if (reviewedProductIds.has(item.id_producto)) {
        const cal = myReviews.find(r => r.idProducto === item.id_producto && r.tipoResena === "PRODUCTO")?.calificacion || 0;
        misResenasItems.push({ orden, item, calificacion: cal });
      } else {
        sinResenar.push({ orden, item });
      }
    });
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-teal-700 pb-2">Dejar una reseña</h2>
      
      {sinResenar.length > 0 ? (
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Productos sin reseñar</h3>
          <div className="grid gap-4">
            {sinResenar.map(({ orden, item }) => (
              <ProductReviewCard
                key={`${orden.id_orden}-${item.id_producto}`}
                item={item}
                sellerName={orden.nombre_vendedor}
                onClick={() => openReviewModal(orden, item)}
              />
            ))}
          </div>
        </section>
      ) : (
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Productos sin reseñar</h3>
          <div className="bg-white border border-gray-200 rounded p-6 text-center text-gray-500">
            Recibe un producto para poder reseñarlo!
          </div>
        </section>
      )}

      {misResenasItems.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 mt-8">Mis reseñas</h3>
          <div className="grid gap-4">
            {misResenasItems.map(({ orden, item, calificacion }) => (
              <ProductReviewCard
                key={`rev-${orden.id_orden}-${item.id_producto}`}
                item={item}
                sellerName={orden.nombre_vendedor}
                calificacion={calificacion}
                isReviewed={true}
                onClick={() => openReviewModal(orden, item)}
              />
            ))}
          </div>
        </section>
      )}

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
