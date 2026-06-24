import { loginAction } from "@/lib/actions/auth";
import LotusLogo from "@/components/LotusLogo";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const hasError = params?.error === "1";
  const next = params?.next || "/vendeur";

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <div className="flex flex-col items-center gap-2 mb-6">
          <LotusLogo size={48} />
          <h1
            className="text-2xl text-lotus-800"
            style={{ fontFamily: "var(--font-script)" }}
          >
            Le Lotus Bleu
          </h1>
          <p className="text-sm text-stone-500">Espace vendeur</p>
        </div>

        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
            />
          </div>

          {hasError && (
            <p className="text-sm text-red-600">Mot de passe incorrect. Réessaie.</p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-lotus-600 text-white text-sm font-medium px-4 py-2 hover:bg-lotus-700 transition"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
