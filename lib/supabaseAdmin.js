import { createClient } from "@supabase/supabase-js";

// Client Supabase "admin" — utilise la clé service_role, qui contourne le RLS.
// À N'UTILISER QUE côté serveur (server actions, route handlers) : ne jamais
// importer ce fichier depuis un composant client ("use client").
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  // On ne lève pas d'erreur au chargement du module (pour ne pas casser le build),
  // mais toute tentative d'utilisation échouera explicitement.
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY n'est pas défini : les actions vendeur échoueront."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || "missing-key", {
  auth: { persistSession: false },
});
