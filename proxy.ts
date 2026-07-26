import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Executa em todas as rotas exceto assets estáticos e arquivos públicos.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|geo/|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|geojson)$).*)",
  ],
};
