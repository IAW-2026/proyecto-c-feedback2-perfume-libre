import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/api(.*)",
  "/"
]);

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;
  
  const isPublicApiEndpoint = 
    req.method === 'GET' && (
      path.match(/^\/api\/resenas\/producto\/[^\/]+(\/resumen)?$/) ||
      path.match(/^\/api\/resenas\/vendedor\/[^\/]+(\/resumen)?$/)
    );

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Verificamos protección en las rutas de API
  if (path.startsWith('/api') && !isPublicApiEndpoint) {
    const { userId } = await auth();
    const apiKey = req.headers.get('api_key');
    
    // Permitir acceso si el usuario está autenticado en Clerk O si manda el API_KEY correcto
    if (!userId && (!apiKey || apiKey !== process.env.FEEDBACK_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Protección para el panel de soporte
  if (path.startsWith('/soporte')) {
    const { userId, sessionClaims } = await auth();
    
    if (userId) {
      // Intentar leer de sessionClaims si está configurado el template
      let role = (sessionClaims?.metadata as any)?.role || (sessionClaims?.public_metadata as any)?.role;
      
      // Si no viene en el token, llamamos a la API de Clerk
      if (!role) {
        try {
          const { clerkClient } = await import("@clerk/nextjs/server");
          const client = await clerkClient();
          const user = await client.users.getUser(userId);
          role = user.publicMetadata?.role;
        } catch (e) {
          console.error("Error al obtener el rol del usuario en middleware:", e);
        }
      }

      if (role !== "admin") {
        return NextResponse.redirect(new URL("/dar-resenas", req.url));
      }
    }
  }

});


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/(.*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};