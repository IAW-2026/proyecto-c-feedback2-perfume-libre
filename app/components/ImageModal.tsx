"use client";

import { useEffect } from "react";

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  useEffect(() => {
    if (imageUrl) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = "unset"; };
    }
  }, [imageUrl]);

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
