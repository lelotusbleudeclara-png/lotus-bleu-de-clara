import "../globals.css";
import { Cormorant_Garamond, Dancing_Script, Work_Sans } from "next/font/google";
import RegisterVendeurSW from "@/components/RegisterVendeurSW";

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
  title: "Espace vendeur — Le Lotus Bleu",
  description: "Interface de gestion du catalogue Le Lotus Bleu",
  manifest: "/vendeur/manifest.json",
  icons: {
    icon: "/vendeur/icon-192.png",
    apple: "/vendeur/icon-512.png",
  },
};

export const viewport = {
  themeColor: "#1e58c2",
};

export default function VendeurRootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${dancingScript.variable} ${workSans.variable}`}
    >
      <body className="bg-ivory text-stone-800 antialiased min-h-screen">
        <RegisterVendeurSW />
        {children}
      </body>
    </html>
  );
}
