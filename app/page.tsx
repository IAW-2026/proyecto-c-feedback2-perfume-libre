import { Show, SignIn } from "@clerk/nextjs";
import Dashboard from "./components/Dashboard";

export default function Home() {
  return (
    <>
      <Show when="signed-out">
        <div className="min-h-screen bg-teal-700 flex flex-col items-center justify-center">
          <div className="mb-8 text-center px-4">
            <h1 className="text-4xl font-bold text-white tracking-tight">Feedback Perfume Libre</h1>
            <p className="text-teal-100 mt-2 text-lg">Inicia sesión para continuar</p>
          </div>
          <SignIn routing="hash" />
        </div>
      </Show>
      <Show when="signed-in">
        <Dashboard />
      </Show>
    </>
  );
}
