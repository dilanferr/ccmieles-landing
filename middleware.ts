import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refresca la sesión de Supabase en cada petición y protege el panel
 * de administración: si no hay usuario autenticado, redirige a /login.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const enAdmin = path.startsWith("/admin");

  // Sin sesión → no puede entrar al panel.
  if (!user && enAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // Kill-switch: un usuario con sesión pero DESACTIVADO (perfiles.activo=false)
  // pierde el acceso de inmediato. Se consulta una sola vez y se reutiliza
  // para no reenviar a un usuario desactivado desde /login al panel (evita bucle).
  let activo = true;
  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("activo")
      .eq("id", user.id)
      .maybeSingle();
    // Sólo bloqueamos si el perfil existe y está EXPLÍCITAMENTE desactivado
    // (fail-open ante error transitorio; la RLS por rol sigue siendo la barrera real).
    activo = perfil ? perfil.activo !== false : true;
  }

  if (user && enAdmin && !activo) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("error", "cuenta_desactivada");
    return NextResponse.redirect(url);
  }

  // Si ya está autenticado y ACTIVO y entra a /login, lo enviamos al panel.
  if (user && activo && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
