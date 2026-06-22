"use client";

import { useState, useRef, useEffect } from "react";
import { Flag, X, Upload } from "lucide-react";

interface ResenaDB {
  idResena: string;
  calificacion: number;
  comentario: string | null;
  createdAt: string;
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

interface ReportModalProps {
  bundle: ReviewBundle | null;
  onClose: () => void;
}

export default function ReportModal({ bundle, onClose }: ReportModalProps) {
  const [reportType, setReportType] = useState<"PRODUCTO" | "VENDEDOR" | null>(null);
  const [reportReason, setReportReason] = useState<"INAPROPIADO" | "FALSO_NO_APLICA">("INAPROPIADO");
  const [reportImages, setReportImages] = useState<{ idImagen: string; url: string }[]>([]);
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bundle) {
      document.body.style.overflow = "hidden";
      if (bundle.resenaProducto && !bundle.resenaVendedor) setReportType("PRODUCTO");
      else if (!bundle.resenaProducto && bundle.resenaVendedor) setReportType("VENDEDOR");
      else setReportType(null);
      
      return () => { document.body.style.overflow = "unset"; };
    }
  }, [bundle]);

  if (!bundle) return null;

  const handleReportSubmit = async () => {
    if (!reportType) return;
    
    const idResena = reportType === "PRODUCTO" ? bundle.resenaProducto?.idResena : bundle.resenaVendedor?.idResena;
    if (!idResena) return;

    setIsReporting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idResena,
          motivo: reportReason,
          archivos: reportImages.map(img => img.url)
        })
      });
      const data = await res.json();
      if (data.estado === "success") {
        setReportSuccess(true);
        setTimeout(() => onClose(), 2000);
      } else {
        alert(data.mensaje);
      }
    } catch (error) {
      console.error(error);
      alert("Error al enviar el reporte");
    } finally {
      setIsReporting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (reportImages.length >= 3) {
      alert("Puedes subir un máximo de 3 imágenes de evidencia");
      return;
    }

    try {
      const filename = encodeURIComponent(file.name);
      const res = await fetch(`/api/upload?filename=${filename}`, {
        method: 'POST',
        body: file,
      });

      const blob = await res.json();
      if (blob.url) {
        setReportImages(prev => [...prev, { idImagen: blob.url, url: blob.url }]);
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Error al subir la imagen");
    }
  };

  const removeReportImage = async (url: string) => {
    setReportImages(prev => prev.filter(img => img.url !== url));
    try {
      await fetch(`/api/upload?url=${encodeURIComponent(url)}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => !isReporting && onClose()}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Flag className="text-red-600" size={20} />
            Reportar Reseña
          </h3>
          <button onClick={() => onClose()} className="text-gray-400 hover:text-gray-600" disabled={isReporting}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-5">
          {reportSuccess ? (
            <div className="text-center py-6 text-teal-700 font-semibold flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-2">
                <Flag className="text-teal-700" size={24} />
              </div>
              Reporte enviado correctamente. Será revisado por un administrador.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">1. ¿Qué reseña deseas reportar?</label>
                <div className="flex flex-col gap-2">
                  <label className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${reportType === "PRODUCTO" ? "border-teal-700 bg-teal-50" : "border-gray-300"} ${!bundle.resenaProducto ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <input 
                      type="radio" 
                      name="reportType" 
                      value="PRODUCTO" 
                      disabled={!bundle.resenaProducto}
                      checked={reportType === "PRODUCTO"} 
                      onChange={() => setReportType("PRODUCTO")} 
                      className="w-4 h-4 text-teal-700" 
                    />
                    <span className="text-gray-800">Reseña sobre el Producto</span>
                  </label>
                  <label className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${reportType === "VENDEDOR" ? "border-teal-700 bg-teal-50" : "border-gray-300"} ${!bundle.resenaVendedor ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <input 
                      type="radio" 
                      name="reportType" 
                      value="VENDEDOR" 
                      disabled={!bundle.resenaVendedor}
                      checked={reportType === "VENDEDOR"} 
                      onChange={() => setReportType("VENDEDOR")} 
                      className="w-4 h-4 text-teal-700" 
                    />
                    <span className="text-gray-800">Reseña sobre el Vendedor</span>
                  </label>
                </div>
              </div>

              {reportType && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">2. Motivo del reporte</label>
                  <select 
                    className="w-full border border-gray-300 rounded p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as any)}
                  >
                    <option value="INAPROPIADO">Contenido Inapropiado / Ofensivo</option>
                    <option value="FALSO_NO_APLICA">Contenido Falso / No Aplica al producto</option>
                  </select>
                </div>
              )}

              {reportType && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">3. Evidencia (Opcional, Max 3)</label>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {reportImages.map((img) => (
                      <div key={img.url} className="relative group">
                        <img src={img.url} alt="Evidencia" className="w-16 h-16 object-cover rounded border border-gray-300" />
                        <button
                          type="button"
                          onClick={() => removeReportImage(img.url)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={reportImages.length >= 3 || isReporting}
                    className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:text-teal-700 hover:border-teal-700 transition-colors disabled:opacity-50"
                  >
                    <Upload size={18} />
                    Agregar imagen
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}

              <div className="mt-2">
                <button 
                  onClick={handleReportSubmit}
                  disabled={!reportType || isReporting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isReporting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : "Enviar Reporte"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
