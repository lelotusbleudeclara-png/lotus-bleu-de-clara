import Link from "next/link";
import LotusLogo from "@/components/LotusLogo";
import { logoutAction } from "@/lib/actions/auth";

const NAV_LINKS = [
  { href: "/vendeur", label: "Tableau de bord" },
  { href: "/vendeur/categories", label: "Catégories" },
  { href: "/vendeur/produits", label: "Produits" },
  { href: "/vendeur/preselections", label: "Présélections" },
  { href: "/vendeur/transactions", label: "Transactions" },
];

export default function VendeurAppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full border-b border-stone-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/vendeur" className="flex items-center gap-2 shrink-0">
            <LotusLogo size={28} />
            <span
              className="text-lg text-lotus-800 hidden sm:inline"
              style={{ fontFamily: "var(--font-script)" }}
            >
              Le Lotus Bleu
            </span>
          </Link>

          <nav className="flex-1 flex items-center gap-1 overflow-x-auto text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-full whitespace-nowrap text-stone-600 hover:bg-lotus-50 hover:text-lotus-700 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-stone-500 hover:text-stone-700 whitespace-nowrap"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
