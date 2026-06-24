import "../globals.css";
import Link from "next/link";
import { Cormorant_Garamond, Dancing_Script, Work_Sans } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import HeaderBar from "@/components/HeaderBar";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-heading",
});
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-script",
});
const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata = {
  title: "Le Lotus Bleu",
  description: "Catalogue de bijoux artisanaux faits main par Clara",
};

export default function SiteLayout({ children }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${dancingScript.variable} ${workSans.variable}`}>
      <body className="bg-ivory text-stone-800 antialiased min-h-screen flex flex-col">
        <CartProvider>
          <HeaderBar />
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">{children}</main>
          <footer className="text-center text-xs text-stone-400 py-6 space-y-1">
            <p>Le Lotus Bleu — bijoux faits main, vente occasionnelle à titre non professionnel.</p>
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
