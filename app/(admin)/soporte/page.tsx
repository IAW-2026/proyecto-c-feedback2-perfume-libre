"use client";

import { useState, useEffect } from "react";
import { Flag, Check, EyeOff, Trash2, Image as ImageIcon } from "lucide-react";
import ImageModal from "@/app/components/ImageModal";
import Pagination from "@/app/components/Pagination";
import ReporteCard from "./components/ReporteCard";

export default function SoportePage() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);

  const fetchReports = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reports?page=${page}`);
      const data = await res.json();
      if (data.estado === "success") {
        setReportes(data.reportes);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (idReporte: string, decision: "RECHAZAR" | "OCULTAR" | "ELIMINAR") => {
    const acciones = {
      RECHAZAR: "desestimar (mantener pública)",
      OCULTAR: "ocultar (no será visible)",
      ELIMINAR: "eliminar"
    };

    if (!confirm(`¿Estás seguro de que deseas ${acciones[decision]} la reseña de este reporte?`)) return;

    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idReporte,
          decision,
          motivoAdmin: "Revisado desde panel de moderación"
        })
      });
      const data = await res.json();
      if (data.estado === "success") {
        fetchReports(currentPage); // Recargar la lista
      } else {
        alert(data.mensaje);
      }
    } catch (err) {
      console.error(err);
      alert("Error procesando la moderación");
    }
  };

  const getMotivoBadge = (motivo: string) => {
    if (motivo === "INAPROPIADO") {
      return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-red-200">Inapropiado/Ofensivo</span>;
    }
    return <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-orange-200">Falso/No Aplica</span>;
  };

  return (
    <>
      <div className="flex justify-between items-end border-b-2 border-teal-700 pb-2 mb-6">
        <h2 className="text-2xl font-bold text-teal-800">Reportes Pendientes</h2>
        <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
          {totalCount} {totalCount === 1 ? 'reporte' : 'reportes'}
        </span>
      </div>

      <div className={loading && reportes.length > 0 ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
        {loading && reportes.length === 0 ? (
          <div className="text-slate-600 text-center py-10">Cargando reportes...</div>
        ) : reportes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Check className="text-green-600" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Todo al día</h3>
              <p className="text-gray-500 mt-1">No hay ningún reporte pendiente de revisión.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {reportes.map((reporte) => (
              <ReporteCard
                key={reporte.idReporte}
                reporte={reporte}
                onModerate={handleModerate}
                onImageClick={setSelectedImage}
              />
            ))}

            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
              disabled={loading}
            />
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </>
  );
}
