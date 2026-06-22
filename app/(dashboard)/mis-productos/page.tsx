"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import ImageModal from "@/app/components/ImageModal";
import ReportModal from "@/app/components/ReportModal";
import ReviewTableRow from "./components/ReviewTableRow";
import { ReviewBundle, SortKey, SortDirection } from "./types";

export default function MisProductosPage() {
  const [bundles, setBundles] = useState<ReviewBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reportBundle, setReportBundle] = useState<ReviewBundle | null>(null);
  
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
              <th className="p-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('producto')}>
                <div className="flex items-center gap-2">Puntaje Producto {SortIcon('producto')}</div>
              </th>
              <th className="p-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('vendedor')}>
                <div className="flex items-center gap-2">Puntaje Vendedor {SortIcon('vendedor')}</div>
              </th>
              <th className="p-4 font-semibold cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('fecha')}>
                <div className="flex items-center gap-2">Fecha {SortIcon('fecha')}</div>
              </th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {sortedBundles.map(bundle => (
              <ReviewTableRow
                key={bundle.idResenaBundle}
                bundle={bundle}
                isExpanded={expandedIds.has(bundle.idResenaBundle)}
                onToggleExpand={toggleExpand}
                onImageClick={setSelectedImage}
                onReportClick={setReportBundle}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      <ImageModal 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
      <ReportModal 
        bundle={reportBundle} 
        onClose={() => setReportBundle(null)} 
      />
    </div>
  );
}
