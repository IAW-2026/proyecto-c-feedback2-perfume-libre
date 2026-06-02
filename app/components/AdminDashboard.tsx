"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Shield, Flag, Check, EyeOff, Trash2, Image as ImageIcon } from "lucide-react";
import ImageModal from "./ImageModal";

export default function AdminDashboard() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (data.estado === "success") {
        setReportes(data.reportes);
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
      ELIMINAR: "eliminar permanentemente"
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
        fetchReports(); // Recargar la lista
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
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Navbar (Admin Theme) */}
      <header className="flex h-16 items-center justify-between bg-slate-800 px-4 text-white shadow-md relative z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-slate-700 rounded-md">
            <Shield size={24} className="text-teal-400" />
          </div>
          <span className="font-semibold text-lg hidden sm:block">
            Panel de Moderación
          </span>
        </div>
        <div>
          <UserButton />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-2 mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Reportes Pendientes</h2>
          <span className="text-sm font-semibold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
            {reportes.length} {reportes.length === 1 ? 'reporte' : 'reportes'}
          </span>
        </div>

        {loading ? (
          <div className="text-slate-600 text-center py-10">Cargando reportes...</div>
        ) : reportes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-10 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Check className="text-green-600" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Todo al día</h3>
              <p className="text-slate-500 mt-1">No hay ningún reporte pendiente de revisión.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {reportes.map((reporte) => (
              <div key={reporte.idReporte} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col lg:flex-row">
                
                {/* Review Info */}
                <div className="flex-1 p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Flag className="text-red-500" size={16} />
                        {getMotivoBadge(reporte.motivo)}
                        <span className="text-xs text-slate-400 ml-2">
                          {new Date(reporte.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-800 text-lg">Reseña Reportada</h4>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-700 italic">
                    "{reporte.resena.comentario || 'Sin comentario escrito'}"
                  </div>

                  {reporte.archivos && reporte.archivos.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                        <ImageIcon size={14} /> Evidencia Adjunta:
                      </span>
                      <div className="flex gap-2 overflow-x-auto">
                        {reporte.archivos.map((archivo: any) => (
                          <img 
                            key={archivo.idArchivo} 
                            src={archivo.url} 
                            alt="Evidencia del reporte" 
                            className="w-20 h-20 object-cover border border-slate-300 rounded cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImage(archivo.url)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions sidebar */}
                <div className="w-full lg:w-72 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 flex flex-col gap-4 justify-center">
                  <h5 className="font-semibold text-slate-700 mb-2 text-center">Acciones de Moderación</h5>
                  
                  <button 
                    onClick={() => handleModerate(reporte.idReporte, "RECHAZAR")}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-100 font-semibold transition-colors"
                  >
                    <Check size={18} className="text-green-600" />
                    Desestimar Reporte
                  </button>
                  
                  <button 
                    onClick={() => handleModerate(reporte.idReporte, "OCULTAR")}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-orange-50 border border-orange-200 text-orange-800 rounded hover:bg-orange-100 font-semibold transition-colors"
                  >
                    <EyeOff size={18} />
                    Ocultar Reseña
                  </button>
                  
                  <button 
                    onClick={() => handleModerate(reporte.idReporte, "ELIMINAR")}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100 font-semibold transition-colors"
                  >
                    <Trash2 size={18} />
                    Eliminar Reseña
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      {/* Image Modal */}
      <ImageModal 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
}
