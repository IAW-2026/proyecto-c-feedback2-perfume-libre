import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
  readOnly?: boolean;
  onRatingChange?: (rating: number) => void;
  hoverRating?: number;
  onHoverChange?: (rating: number) => void;
}

export default function StarRating({ 
  rating, 
  size = 14, 
  readOnly = true,
  onRatingChange,
  hoverRating = 0,
  onHoverChange
}: StarRatingProps) {
  if (readOnly && rating === 0) {
    return <span className="text-gray-400 text-sm">Sin calificar</span>;
  }

  return (
    <div className={`flex gap-0.5 ${readOnly ? 'text-teal-700' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = readOnly 
          ? (star <= rating ? "currentColor" : "none")
          : (star <= (hoverRating || rating) ? "#0f766e" : "none");
          
        return (
          <Star
            key={star}
            size={size}
            fill={fill}
            strokeWidth={readOnly ? 2 : (star <= (hoverRating || rating) ? 0 : 1)}
            stroke={readOnly ? "currentColor" : "#0f766e"}
            className={readOnly ? "" : "cursor-pointer transition-transform hover:scale-110"}
            onClick={() => !readOnly && onRatingChange?.(star)}
            onMouseEnter={() => !readOnly && onHoverChange?.(star)}
            onMouseLeave={() => !readOnly && onHoverChange?.(0)}
          />
        );
      })}
    </div>
  );
}
