import "./globals.css";
import Link from "next/link";
import { CartProvider } from "@/lib/cart-context";
import HeaderBar from "@/components/HeaderBar";

export const metadata = {
  title: "Le Lotus Bleu de Clara",
  description: "Catalogue de bijoux artisanaux faits main par Clara",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-stone-50 text-stone-800 antialiased min-h-screen flex flex-col">
        <CartProvider>
          <HeaderBar />
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">{children}</main>
          <footer className="text-center text-xs text-stone-400 py-6 space-y-1">
            <p>Le Lotus Bleu de Clara — bijoux faits main, vente occasionnelle à titre non professionnel.</p>
            <p>
              <Link href="/mentions-legales" className="underline hover:text-stone-600">
                Mentions légales · CGV · Politique de confidentialité
              </Link>
            </p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
