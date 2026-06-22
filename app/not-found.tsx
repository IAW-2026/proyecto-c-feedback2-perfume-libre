import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mb-2">
          <SearchX size={32} />
        </div>
        <h2 className="text-2xl font-bold">Página no encontrada</h2>
        <p className="text-slate-500">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
        <Link
          href="/"
          className="mt-4 px-6 py-2.5 bg-teal-700 text-white font-semibold rounded hover:bg-teal-800 transition-colors w-full sm:w-auto"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
