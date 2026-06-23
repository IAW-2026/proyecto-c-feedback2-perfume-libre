import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/api(.*)",
  "/"
]);

export default clerkMiddleware(async (auth, req) => {
  // Verificamos protección en las rutas de API
  if (req.nextUrl.pathname.startsWith('/api')) {
    const { userId } = await auth();
    const apiKey = req.headers.get('x-api-key');
    
    // Permitir acceso si el usuario está autenticado en Clerk O si manda el API_KEY correcto
    if (!userId && (!apiKey || apiKey !== process.env.API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
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