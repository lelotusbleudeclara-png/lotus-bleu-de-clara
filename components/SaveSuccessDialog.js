"use client";
import { useRouter } from "next/navigation";

export default function SaveSuccessDialog({ show }) {
  const router = useRouter();
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
        <p className="text-lg text-lotus-800 font-medium text-center" style={{ fontFamily: "var(--font-heading)" }}>
          Produit enregistré !
        </p>
        <p className="text-sm text-stone-600 text-center">Voulez-vous créer un nouveau produit ?</p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/vendeur/produits/nouveau")}
            className="flex-1 rounded-full bg-lotus-600 text-white text-sm font-medium px-4 py-2 hover:bg-lotus-700 transition">
            Oui
          </button>
          <button
            onClick={() => router.push("/vendeur")}
            className="flex-1 rounded-full border border-stone-300 text-stone-700 text-sm font-medium px-4 py-2 hover:bg-stone-50 transition">
            Non
          </button>
        </div>
      </div>
    </div>
  );
}
