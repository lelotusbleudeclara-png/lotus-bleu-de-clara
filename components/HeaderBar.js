"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import LotusLogo from "@/components/LotusLogo";

export default function HeaderBar() {
  const { items } = useCart();

  return (
    <header className="w-full border-b border-stone-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <LotusLogo size={36} />
          <span className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-script)" }}>
            Le Lotus Bleu
          </span>
        </Link>
        <Link
          href="/panier"
          className="relative inline-flex items-center gap-2 rounded-full bg-lotus-600 text-white text-sm px-4 py-2 hover:bg-lotus-700 transition"
        >
          Panier
          <span className="inline-flex items-center justify-center rounded-full bg-white text-lotus-700 text-xs font-bold w-5 h-5">
            {items.length}
          </span>
        </Link>
      </div>
    </header>
  );
}
