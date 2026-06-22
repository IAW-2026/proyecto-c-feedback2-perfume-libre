import StarRating from "@/app/components/StarRating";

interface ProductReviewCardProps {
  item: {
    id_producto: string;
    nombre_producto: string;
    imagen: string;
  };
  sellerName: string;
  calificacion?: number;
  isReviewed?: boolean;
  onClick: () => void;
}

export default function ProductReviewCard({
  item,
  sellerName,
  calificacion,
  isReviewed = false,
  onClick
}: ProductReviewCardProps) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded p-4 flex items-center justify-between shadow-sm hover:shadow transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <img 
          src={item.imagen} 
          alt={item.nombre_producto} 
          className="w-16 h-16 object-cover bg-gray-100 rounded"
        />
        <div>
          <h4 className="font-semibold text-gray-800">{item.nombre_producto}</h4>
          {isReviewed && calificacion !== undefined ? (
            <div className="mt-1">
              <StarRating rating={calificacion} />
            </div>
          ) : (
            <p className="text-sm text-gray-500">Vendido por: {sellerName}</p>
          )}
        </div>
      </div>
      <div className={isReviewed ? "text-gray-500 font-medium text-sm flex items-center gap-1" : "text-teal-700 font-medium text-sm"}>
        {isReviewed ? "Editar" : "Calificar"}
      </div>
    </div>
  );
}
