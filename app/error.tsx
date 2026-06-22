"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold">¡Algo salió mal!</h2>
        <p className="text-slate-500">
          Ocurrió un error inesperado al cargar esta página. Por favor, intenta nuevamente.
        </p>
        <button
          onClick={() => reset()}
          className="mt-4 px-6 py-2.5 bg-teal-700 text-white font-semibold rounded hover:bg-teal-800 transition-colors w-full sm:w-auto"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
