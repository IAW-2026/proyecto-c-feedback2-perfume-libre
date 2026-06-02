"use client";

import { useEffect, useState } from "react";
import { Star, ChevronDown, Check } from "lucide-react";
import ReviewModal from "./ReviewModal";

interface OrderItem {
  id_producto: string;
  nombre_producto: string;
  imagen: string;
}

interface Order {
  id_orden: string;
  id_vendedor: string;
  nombre_vendedor: string;
  fecha_compra: string;
  items: OrderItem[];
}

interface Resena {
  idResena: string;
  idProducto?: string;
  idOrden: string;
  calificacion: number;
  comentario: string | null;
  tipoResena: "PRODUCTO" | "VENDEDOR";
  imagenes?: { idImagen: string, url: string }[];
}

export default function BuyerDashboard() {
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
    fetchOrdersAndReviews(); // Refetch to move the item to the reviewed list
  };

  const openReviewModal = (orden: Order, item: OrderItem) => {
    // Buscar si ya tiene reseñas
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

  // Dividimos en 2 listas. Un producto está "reseñado" si existe una reseña de tipo PRODUCTO hecha por el usuario
  // para el id_producto correspondiente.
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
              <div 
                key={`${orden.id_orden}-${item.id_producto}`}
                className="bg-white border border-gray-200 rounded p-4 flex items-center justify-between shadow-sm hover:shadow transition-shadow cursor-pointer"
                onClick={() => openReviewModal(orden, item)}
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={item.imagen} 
                    alt={item.nombre_producto} 
                    className="w-16 h-16 object-cover bg-gray-100 rounded"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.nombre_producto}</h4>
                    <p className="text-sm text-gray-500">Vendido por: {orden.nombre_vendedor}</p>
                  </div>
                </div>
                <div className="text-teal-700 font-medium text-sm">
                  Calificar
                </div>
              </div>
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
              <div 
                key={`rev-${orden.id_orden}-${item.id_producto}`}
                className="bg-white border border-gray-200 rounded p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow transition-shadow"
                onClick={() => openReviewModal(orden, item)}
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={item.imagen} 
                    alt={item.nombre_producto} 
                    className="w-16 h-16 object-cover bg-gray-100 rounded"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.nombre_producto}</h4>
                    <div className="flex text-teal-700 mt-1">
                      {[1,2,3,4,5].map(star => (
                         <Star key={star} size={14} fill={star <= calificacion ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-gray-500 font-medium text-sm flex items-center gap-1">
                  Editar
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal de Calificación */}
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

