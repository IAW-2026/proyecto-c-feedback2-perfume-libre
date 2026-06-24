import { Flag, Check, EyeOff, Trash2, Image as ImageIcon, User, Clock } from "lucide-react";

interface Moderacion {
  decision: "RECHAZAR" | "OCULTAR" | "ELIMINAR";
  nombreModerador?: string;
  createdAt: string | Date;
}

interface ReporteCardProps {
  reporte: any;
  isHistorial?: boolean;
  onModerate: (idReporte: string, decision: "RECHAZAR" | "OCULTAR" | "ELIMINAR") => void;
  onImageClick: (url: string) => void;
}

export default function ReporteCard({
  reporte,
  isHistorial = false,
  onModerate,
  onImageClick
}: ReporteCardProps) {

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
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col lg:flex-row">
      
      {/* Review Info */}
      <div className="flex-1 p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flag className="text-red-500" size={16} />
              {getMotivoBadge(reporte.motivo)}
              <span className="text-xs text-gray-400 ml-2">
                {isHistorial ? "Reportado: " : ""}
                {new Date(reporte.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h4 className="font-semibold text-gray-800 text-lg">Reseña Reportada</h4>
          </div>
          {isHistorial && reporte.moderacionActual && (
            <div>
              {getResolucionBadge(reporte.moderacionActual.decision)}
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded border border-gray-100 text-gray-700 italic">
          "{reporte.resena.comentario || 'Sin comentario escrito'}"
        </div>

        {/* Info de la moderación */}
        {isHistorial && reporte.moderacionActual && (
          <div className="bg-teal-50 border border-teal-100 p-3 rounded flex flex-col sm:flex-row gap-4 text-sm text-teal-900 mt-2">
            <div className="flex items-center gap-1">
              <User size={16} className="text-teal-700" />
              <span className="font-semibold">Moderador:</span> 
              {reporte.moderacionActual.nombreModerador}
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-teal-700" />
              <span className="font-semibold">Fecha resolución:</span> 
              {new Date(reporte.moderacionActual.createdAt).toLocaleString()}
            </div>
          </div>
        )}

        {reporte.archivos && reporte.archivos.length > 0 && (
          <div className="mt-2">
            <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2">
              <ImageIcon size={14} /> Evidencia Adjunta:
            </span>
            <div className="flex gap-2 overflow-x-auto">
              {reporte.archivos.map((archivo: any) => (
                <img 
                  key={archivo.idArchivo} 
                  src={archivo.url} 
                  alt="Evidencia del reporte" 
                  className="w-20 h-20 object-cover border border-gray-300 rounded cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => onImageClick(archivo.url)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions sidebar */}
      <div className="w-full lg:w-72 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 flex flex-col gap-4 justify-center">
        <h5 className="font-semibold text-gray-700 mb-2 text-center">
          {isHistorial ? "Cambiar Resolución" : "Acciones de Moderación"}
        </h5>
        
        {(!isHistorial || reporte.moderacionActual?.decision !== "RECHAZAR") && (
          <button 
            onClick={() => onModerate(reporte.idReporte, "RECHAZAR")}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 font-semibold transition-colors"
          >
            <Check size={18} className="text-green-600" />
            {isHistorial ? "Cambiar a Desestimado" : "Desestimar Reporte"}
          </button>
        )}
        
        {(!isHistorial || reporte.moderacionActual?.decision !== "OCULTAR") && (
          <button 
            onClick={() => onModerate(reporte.idReporte, "OCULTAR")}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-orange-50 border border-orange-200 text-orange-800 rounded hover:bg-orange-100 font-semibold transition-colors"
          >
            <EyeOff size={18} />
            {isHistorial ? "Cambiar a Ocultado" : "Ocultar Reseña"}
          </button>
        )}
        
        {(!isHistorial || reporte.moderacionActual?.decision !== "ELIMINAR") && (
          <button 
            onClick={() => onModerate(reporte.idReporte, "ELIMINAR")}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100 font-semibold transition-colors"
          >
            <Trash2 size={18} />
            {isHistorial ? "Cambiar a Eliminado" : "Eliminar Reseña"}
          </button>
        )}
      </div>

    </div>
  );
}
