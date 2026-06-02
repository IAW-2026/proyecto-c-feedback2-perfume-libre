"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";

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

interface ResenaInfo {
  idResena: string;
  calificacion: number;
  comentario: string | null;
  imagenes?: { idImagen: string, url: string }[];
}

interface ReviewModalProps {
  product: { orden: Order; item: OrderItem };
  existingReviews?: {
    producto?: ResenaInfo;
    vendedor?: ResenaInfo;
  };
  onClose: () => void;
}

export default function ReviewModal({ product, existingReviews, onClose }: ReviewModalProps) {
  const isEditing = !!(existingReviews?.producto || existingReviews?.vendedor);

  const [productRating, setProductRating] = useState(existingReviews?.producto?.calificacion || 0);
  const [sellerRating, setSellerRating] = useState(existingReviews?.vendedor?.calificacion || 0);
  const [productComment, setProductComment] = useState(existingReviews?.producto?.comentario || "");
  const [sellerComment, setSellerComment] = useState(existingReviews?.vendedor?.comentario || "");
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{idImagen: string, url: string}[]>(existingReviews?.producto?.imagenes || []);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (e.target.files.length > 3) {
        setError("Puedes subir un máximo de 3 imágenes.");
        setFiles([]);
        e.target.value = "";
        return;
      }
      setFiles(Array.from(e.target.files));
      setError("");
    }
  };

  const handleDeleteImage = (img: {idImagen: string, url: string}) => {
    setDeletedImages(prev => [...prev, img.url]);
    setExistingImages(prev => prev.filter(i => i.idImagen !== img.idImagen));
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que deseas eliminar ambas reseñas de forma permanente?")) return;
    
    setSubmitState("loading");
    setError("");

    try {
      if (existingReviews?.producto?.idResena) {
        await fetch(`/api/resenas/producto?id_resena=${existingReviews.producto.idResena}`, { method: "DELETE" });
      }
      if (existingReviews?.vendedor?.idResena) {
        await fetch(`/api/resenas/vendedor?id_resena=${existingReviews.vendedor.idResena}`, { method: "DELETE" });
      }
      setSubmitState("success");
      setTimeout(() => onClose(), 500);
    } catch (err: any) {
      setError("Error al eliminar reseñas.");
      setSubmitState("idle");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productRating === 0 || sellerRating === 0) {
      setError("Debes calificar tanto el producto como al vendedor.");
      return;
    }
    if ((productRating < 3 && productComment.trim() === "") || (sellerRating < 3 && sellerComment.trim() === "")) {
      setError("El comentario es obligatorio si la calificación es menor a 3 estrellas.");
      return;
    }

    setSubmitState("loading");
    setError("");

    try {
      // Subir imágenes si existen
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
          method: "POST",
          body: file,
        });
        if (res.ok) {
          const blob = await res.json();
          uploadedUrls.push(blob.url);
        }
      }

      // Subimos la reseña del producto
      const prodRes = await fetch("/api/resenas/producto", {
        method: existingReviews?.producto ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_resena: existingReviews?.producto?.idResena,
          id_orden: product.orden.id_orden,
          id_producto: product.item.id_producto,
          puntuacion: productRating,
          comentario: productComment,
          ...(uploadedUrls.length > 0 && { imagenes: uploadedUrls }),
          ...(deletedImages.length > 0 && { imagenesEliminar: deletedImages })
        })
      });

      if (!prodRes.ok) {
        const d = await prodRes.json();
        throw new Error(d.mensaje || "Error al reseñar producto");
      }

      // Subimos la reseña del vendedor
      const sellerRes = await fetch("/api/resenas/vendedor", {
        method: existingReviews?.vendedor ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_resena: existingReviews?.vendedor?.idResena,
          id_orden: product.orden.id_orden,
          id_vendedor: product.orden.id_vendedor,
          puntuacion: sellerRating,
          comentario: sellerComment
        })
      });

      if (!sellerRes.ok) {
        const d = await sellerRes.json();
        throw new Error(d.mensaje || "Error al reseñar vendedor");
      }
      
      setSubmitState("success");
      setTimeout(() => onClose(), 500);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al enviar las reseñas.");
      setSubmitState("idle");
    }
  };

  const [hoveredProductRating, setHoveredProductRating] = useState(0);
  const [hoveredSellerRating, setHoveredSellerRating] = useState(0);

  const renderStars = (
    rating: number, 
    setRating: (val: number) => void,
    hoverRating: number,
    setHoverRating: (val: number) => void
  ) => (
    <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        let colorClass = "text-gray-300";
        let fill = "none";

        if (hoverRating > 0) {
          if (star <= hoverRating) {
            if (star <= rating) {
              colorClass = "text-teal-700";
              fill = "currentColor";
            } else {
              colorClass = "text-teal-700/50";
              fill = "currentColor";
            }
          } else {
            colorClass = "text-gray-300";
            fill = "none";
          }
        } else {
          if (star <= rating) {
            colorClass = "text-teal-700";
            fill = "currentColor";
          } else {
            colorClass = "text-gray-300";
            fill = "none";
          }
        }

        return (
          <button
            key={star}
            type="button"
            disabled={submitState !== "idle"}
            onClick={() => submitState === "idle" && setRating(star)}
            onMouseEnter={() => submitState === "idle" && setHoverRating(star)}
            className={`focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorClass}`}
          >
            <Star size={32} fill={fill} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-4"
      onClick={(e) => {
        if (submitState !== "idle") return;
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-teal-700 text-white">
          <h2 className="text-xl font-bold">{isEditing ? "Editar Reseña" : "Dejar Reseña"}</h2>
          <button 
            onClick={() => submitState === "idle" && onClose()} 
            className={`p-1 rounded transition-colors ${submitState === "idle" ? "hover:bg-teal-600" : "opacity-50 cursor-not-allowed"}`}
            disabled={submitState !== "idle"}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            <img src={product.item.imagen} alt={product.item.nombre_producto} className="w-16 h-16 object-cover bg-gray-100 border border-gray-200 rounded" />
            <div>
              <h3 className="font-semibold text-gray-800">{product.item.nombre_producto}</h3>
              <p className="text-sm text-gray-500">Vendedor: {product.orden.nombre_vendedor}</p>
            </div>
          </div>

          <form id="review-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-gray-700 font-semibold mb-2">Califica el Producto</label>
              {renderStars(productRating, setProductRating, hoveredProductRating, setHoveredProductRating)}
              <textarea 
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 resize-none h-20 text-gray-900 mt-4 text-sm disabled:opacity-50 disabled:bg-gray-200 disabled:cursor-not-allowed bg-white"
                placeholder="Escribe tu experiencia con el producto..."
                value={productComment}
                disabled={submitState !== "idle"}
                onChange={(e) => setProductComment(e.target.value)}
              ></textarea>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-gray-700 font-semibold mb-2">Califica al Vendedor</label>
              {renderStars(sellerRating, setSellerRating, hoveredSellerRating, setHoveredSellerRating)}
              <textarea 
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 resize-none h-20 text-gray-900 mt-4 text-sm disabled:opacity-50 disabled:bg-gray-200 disabled:cursor-not-allowed bg-white"
                placeholder="Escribe tu experiencia con el vendedor..."
                value={sellerComment}
                disabled={submitState !== "idle"}
                onChange={(e) => setSellerComment(e.target.value)}
              ></textarea>
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-gray-700 font-semibold">Imágenes (Max 3)</label>
              
              {/* Existing Images in Edit Mode */}
              {isEditing && existingImages.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-2">
                  {existingImages.map(img => (
                    <div key={img.idImagen} className="relative w-16 h-16 group">
                      <img src={img.url} alt="Review" className="w-full h-full object-cover rounded border border-gray-200" />
                      <button 
                        type="button"
                        onClick={() => submitState === "idle" && handleDeleteImage(img)}
                        disabled={submitState !== "idle"}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded disabled:opacity-0 disabled:cursor-not-allowed"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!isEditing && (
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange}
                  disabled={submitState !== "idle"}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                />
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200 text-sm">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between gap-3 bg-gray-50">
          <div>
            {isEditing && (
              <button 
                type="button" 
                onClick={handleDelete}
                disabled={submitState !== "idle"}
                className="px-5 py-2 text-red-700 font-medium hover:bg-red-50 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Eliminar Reseña
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => submitState === "idle" && onClose()}
              disabled={submitState !== "idle"}
              className="px-5 py-2 text-gray-700 font-medium hover:bg-gray-200 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              form="review-form"
              disabled={submitState !== "idle"}
              className={`px-5 py-2 text-white font-medium transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed ${submitState === "success" ? "bg-green-600" : "bg-teal-700 hover:bg-teal-800"}`}
            >
              {submitState === "loading" ? "Enviando..." : submitState === "success" ? "Enviado" : (isEditing ? "Guardar Cambios" : "Enviar Reseñas")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
