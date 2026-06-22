import { Fragment } from "react";
import { ChevronDown, ChevronUp, Flag } from "lucide-react";
import StarRating from "@/app/components/StarRating";
import { ReviewBundle } from "../types";

interface ReviewTableRowProps {
  bundle: ReviewBundle;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onImageClick: (url: string) => void;
  onReportClick: (bundle: ReviewBundle) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

export default function ReviewTableRow({
  bundle,
  isExpanded,
  onToggleExpand,
  onImageClick,
  onReportClick,
}: ReviewTableRowProps) {
  const allImages = [
    ...(bundle.resenaProducto?.imagenes || []),
    ...(bundle.resenaVendedor?.imagenes || [])
  ];
  const fecha = bundle.resenaVendedor?.createdAt || bundle.resenaProducto?.createdAt;

  return (
    <Fragment>
      <tr 
        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50' : ''}`}
        onClick={() => onToggleExpand(bundle.idResenaBundle)}
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
        <td className="p-4"><StarRating rating={bundle.resenaProducto?.calificacion || 0} /></td>
        <td className="p-4"><StarRating rating={bundle.resenaVendedor?.calificacion || 0} /></td>
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
                        onClick={() => onImageClick(img.url)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2 flex justify-end">
                <button 
                  onClick={(e) => { e.stopPropagation(); onReportClick(bundle); }}
                  className="flex items-center gap-2 text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded transition-colors text-sm font-semibold border border-red-200"
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
}
