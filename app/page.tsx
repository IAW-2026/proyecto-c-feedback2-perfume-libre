import { auth, currentUser } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen bg-teal-700 flex flex-col items-center justify-center">
        <div className="mb-8 text-center px-4">
          <h1 className="text-4xl font-bold text-white tracking-tight">Feedback Perfume Libre</h1>
          <p className="text-teal-100 mt-2 text-lg">Inicia sesión para continuar</p>
        </div>
        <SignIn routing="hash" />
      </div>
    );
  }

  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;

  if (role === "admin") {
    redirect("/soporte");
  }

  redirect("/dar-resenas");
}
