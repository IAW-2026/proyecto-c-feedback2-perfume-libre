"use client";

import { useState, useEffect } from "react";
import { Flag, Check, EyeOff, Trash2, Image as ImageIcon, User, Clock } from "lucide-react";
import ImageModal from "@/app/components/ImageModal";
import Pagination from "@/app/components/Pagination";
import ReporteCard from "../components/ReporteCard";

export default function HistorialReportesPage() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filtros
  const [filters, setFilters] = useState({
    RECHAZAR: true,
    OCULTAR: true,
    ELIMINAR: true
  });

  useEffect(() => {
    fetchHistorial(currentPage);
  }, [currentPage, filters]);

  const fetchHistorial = async (page: number) => {
    try {
      setLoading(true);
      
      const activeDecisions = Object.entries(filters)
        .filter(([_, isActive]) => isActive)
        .map(([key]) => key);
        
      const res = await fetch(`/api/admin/reports/historial?page=${page}&decisions=${activeDecisions.join(",")}`);
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

    if (!confirm(`¿Estás seguro de que deseas cambiar la resolución a ${acciones[decision]}?`)) return;

    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idReporte,
          decision,
          motivoAdmin: "Modificado desde historial"
        })
      });
      const data = await res.json();
      if (data.estado === "success") {
        fetchHistorial(currentPage); // Recargar la lista para ver actualización
      } else {
        alert(data.mensaje);
      }
    } catch (err) {
      console.error(err);
      alert("Error procesando la moderación");
    }
  };

  const handleFilterChange = (decision: "RECHAZAR" | "OCULTAR" | "ELIMINAR") => {
    setFilters(prev => ({ ...prev, [decision]: !prev[decision] }));
    setCurrentPage(1); // Volver a la página 1 al cambiar filtros
  };

  const getMotivoBadge = (motivo: string) => {
    if (motivo === "INAPROPIADO") {
      return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-red-200">Inapropiado/Ofensivo</span>;
    }
    return <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-orange-200">Falso/No Aplica</span>;
  };

  const getResolucionBadge = (decision: string) => {
    if (decision === "RECHAZAR") return <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">Desestimado</span>;
    if (decision === "OCULTAR") return <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-1 rounded-full border border-orange-200">Ocultado</span>;
    if (decision === "ELIMINAR") return <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">Eliminado</span>;
    return null;
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-teal-700 pb-2 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-teal-800 mb-1">Historial de Reportes</h2>
          <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
            {totalCount} {totalCount === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>
        
        {/* Filtros */}
        <div className="flex gap-4 items-center bg-white p-2 rounded border border-gray-200 shadow-sm text-sm">
          <span className="font-semibold text-gray-600 mr-2">Mostrar:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filters.RECHAZAR} 
              onChange={() => handleFilterChange("RECHAZAR")}
              className="accent-teal-600 w-4 h-4"
            />
            <span className="text-gray-700">Desestimados</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filters.OCULTAR} 
              onChange={() => handleFilterChange("OCULTAR")}
              className="accent-teal-600 w-4 h-4"
            />
            <span className="text-gray-700">Ocultados</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input 
              type="checkbox" 
              checked={filters.ELIMINAR} 
              onChange={() => handleFilterChange("ELIMINAR")}
              className="accent-teal-600 w-4 h-4"
            />
            <span className="text-gray-700">Eliminados</span>
          </label>
        </div>
      </div>

      <div className={loading && reportes.length > 0 ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
        {loading && reportes.length === 0 ? (
          <div className="text-gray-600 text-center py-10">Cargando historial...</div>
        ) : reportes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Check className="text-teal-600" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Historial vacío</h3>
              <p className="text-gray-500 mt-1">
                {filters.RECHAZAR && filters.OCULTAR && filters.ELIMINAR
                  ? "Aún no se ha moderado ningún reporte."
                  : "No hay reportes que coincidan con los filtros seleccionados."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {reportes.map((reporte) => (
              <ReporteCard
                key={reporte.idReporte}
                reporte={reporte}
                isHistorial={true}
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
