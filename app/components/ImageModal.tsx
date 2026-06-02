"use client";

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <img 
        src={imageUrl} 
        alt="Imagen ampliada" 
        className="max-w-full max-h-full object-contain cursor-pointer rounded shadow-2xl"
      />
    </div>
  );
}
