"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { Star, ChevronDown, ChevronUp, Flag, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface ResenaDB {
  idResena: string;
  calificacion: number;
  comentario: string | null;
  createdAt: string;
  imagenes?: { idImagen: string; url: string }[];
}

interface ReviewBundle {
  idResenaBundle: string;
  productoInfo: {
    nombre_producto: string;
    imagen: string;
  };
  resenaProducto: ResenaDB | null;
  resenaVendedor: ResenaDB | null;
}

type SortKey = 'nombre' | 'vendedor' | 'producto' | 'fecha';
type SortDirection = 'asc' | 'desc';

export default function SellerDashboard() {
  const [bundles, setBundles] = useState<ReviewBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [sortKey, setSortKey] = useState<SortKey>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/mis-ventas");
        const data = await res.json();
        if (data.estado === "success") {
          setBundles(data.resenas);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleReport = (id: string) => {
    alert(`Abriendo modal de reporte para la orden ${id} (Pendiente de implementar en Etapa 4)`);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedBundles = useMemo(() => {
    return [...bundles].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortKey === 'nombre') {
        valA = a.productoInfo.nombre_producto.toLowerCase();
        valB = b.productoInfo.nombre_producto.toLowerCase();
      } else if (sortKey === 'vendedor') {
        valA = a.resenaVendedor?.calificacion || 0;
        valB = b.resenaVendedor?.calificacion || 0;
      } else if (sortKey === 'producto') {
        valA = a.resenaProducto?.calificacion || 0;
        valB = b.resenaProducto?.calificacion || 0;
      } else if (sortKey === 'fecha') {
        const dateA = a.resenaVendedor?.createdAt || a.resenaProducto?.createdAt || 0;
        const dateB = b.resenaVendedor?.createdAt || b.resenaProducto?.createdAt || 0;
        valA = new Date(dateA).getTime();
        valB = new Date(dateB).getTime();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [bundles, sortKey, sortDirection]);

  if (loading) {
    return <div className="text-teal-700 text-center py-10">Cargando reseñas de tus ventas...</div>;
  }
  
  if (bundles.length === 0) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-teal-700 pb-2">Reseñas a mis productos</h2>
        <p className="text-gray-500">Aún no has recibido reseñas en tus ventas.</p>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    if (rating === 0) return <span className="text-gray-400 text-sm">Sin calificar</span>;
    return (
      <div className="flex gap-0.5 text-teal-700">
        {[1,2,3,4,5].map(star => (
          <Star key={star} size={14} fill={star <= rating ? "currentColor" : "none"} />
        ))}
      </div>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const SortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown size={14} className="text-gray-400" />;
    return sortDirection === 'asc' ? <ArrowUp size={14} className="text-teal-700" /> : <ArrowDown size={14} className="text-teal-700" />;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-teal-700 pb-2 mb-2">Reseñas a mis productos</h2>
      
      <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <th className="p-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('nombre')}>
                <div className="flex items-center gap-2">Nombre del Producto {SortIcon('nombre')}</div>
              </th>
              <th className="p-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('vendedor')}>
                <div className="flex items-center gap-2">Puntaje Vendedor {SortIcon('vendedor')}</div>
              </th>
              <th className="p-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('producto')}>
                <div className="flex items-center gap-2">Puntaje Producto {SortIcon('producto')}</div>
              </th>
              <th className="p-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('fecha')}>
                <div className="flex items-center gap-2">Fecha {SortIcon('fecha')}</div>
              </th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {sortedBundles.map(bundle => {
              const isExpanded = expandedIds.has(bundle.idResenaBundle);
              const allImages = [
                ...(bundle.resenaProducto?.imagenes || []),
                ...(bundle.resenaVendedor?.imagenes || [])
              ];
              const fecha = bundle.resenaVendedor?.createdAt || bundle.resenaProducto?.createdAt;

              return (
                <Fragment key={bundle.idResenaBundle}>
                  <tr 
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50' : ''}`}
                    onClick={() => toggleExpand(bundle.idResenaBundle)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={bundle.productoInfo.imagen} 
                          alt={bundle.productoInfo.nombre_producto} 
                          className="w-10 h-10 object-cover bg-gray-100 rounded"
                        />
                        <span className="font-semibold text-gray-800">{bundle.productoInfo.nombre_producto}</span>
                      </div>
                    </td>
                    <td className="p-4">{renderStars(bundle.resenaVendedor?.calificacion || 0)}</td>
                    <td className="p-4">{renderStars(bundle.resenaProducto?.calificacion || 0)}</td>
                    <td className="p-4 text-sm text-gray-500">{formatDate(fecha)}</td>
                    <td className="p-4 text-gray-400 text-right">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={5} className="p-0 border-b border-gray-200">
                        <div className="p-6 bg-gray-50 flex flex-col gap-4 shadow-inner">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Sobre el producto:</span>
                              {bundle.resenaProducto?.comentario ? (
                                <p className="text-gray-700 whitespace-pre-wrap">{bundle.resenaProducto.comentario}</p>
                              ) : (
                                <span className="italic text-gray-400">Sin comentarios.</span>
                              )}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Sobre el vendedor:</span>
                              {bundle.resenaVendedor?.comentario ? (
                                <p className="text-gray-700 whitespace-pre-wrap">{bundle.resenaVendedor.comentario}</p>
                              ) : (
                                <span className="italic text-gray-400">Sin comentarios.</span>
                              )}
                            </div>
                          </div>
                          
                          {allImages.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Imágenes adjuntas:</span>
                              <div className="flex gap-2 overflow-x-auto">
                                {allImages.map(img => (
                                  <img 
                                    key={img.idImagen} 
                                    src={img.url} 
                                    alt="Imagen adjunta" 
                                    loading="lazy" 
                                    className="w-24 h-24 object-cover border border-gray-300 rounded cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setSelectedImage(img.url)}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-2 flex justify-end">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleReport(bundle.idResenaBundle); }}
                              className="flex items-center gap-2 text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded transition-colors text-sm font-semibold"
                            >
                              <Flag size={16} />
                              Reportar reseña
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Imagen ampliada" 
            className="max-w-full max-h-full object-contain cursor-pointer rounded shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
