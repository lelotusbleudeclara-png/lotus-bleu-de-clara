"use client";

import { useState, useTransition } from "react";
import { createPreselection } from "@/lib/actions/public";

export default function PreselectionForm({ products }) {
  const [selected, setSelected] = useState([]);
  const [isMinor, setIsMinor] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function toggle(product) {
    setSelected((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, { id: product.id, name: product.name, price: product.price }]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!selected.length) { setError("Sélectionne au moins un bijou."); return; }
    const fd = new FormData(e.target);
    fd.set("items_json", JSON.stringify(selected));
    setError(null);
    startTransition(async () => {
      try {
        const res = await createPreselection(fd);
        setDone(res);
      } catch (err) {
        setError(err.message || "Une erreur est survenue.");
      }
    });
  }

  if (done) {
    return (
      <div className="text-center space-y-2 py-8">
        <p className="text-2xl">✓</p>
        <p className="text-lotus-700 font-medium">Présélection envoyée !</p>
        {done.isMinor && (
          <p className="text-sm text-stone-500">Un email de confirmation a été envoyé au parent ou tuteur. La commande sera finalisée après son accord.</p>
        )}
        {!done.isMinor && (
          <p className="text-sm text-stone-500">Clara te recontactera très bientôt pour organiser l&apos;échange.</p>
        )}
      </div>
    );
  }

  const total = selected.reduce((s, p) => s + Number(p.price), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      {/* Product selection */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">Bijoux sélectionnés</p>
        <div className="space-y-2 max-h-56 overflow-y-auto border border-stone-100 rounded-xl p-3">
          {products.map((p) => {
            const isOn = !!selected.find((s) => s.id === p.id);
            return (
              <label key={p.id} className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition ${isOn ? "bg-lotus-50" : "hover:bg-stone-50"}`}>
                <input type="checkbox" checked={isOn} onChange={() => toggle(p)} className="rounded" />
                <span className="flex-1 text-sm text-stone-700">{p.name}</span>
                <span className="text-sm font-medium text-lotus-700">{Number(p.price).toFixed(2)} €</span>
              </label>
            );
          })}
        </div>
        {selected.length > 0 && (
          <p className="text-right text-sm font-semibold text-lotus-700 mt-1">Total : {total.toFixed(2)} €</p>
        )}
      </div>

      {/* Buyer info */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Prénom et nom</label>
          <input type="text" name="buyer_name" required className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
          <input type="email" name="buyer_email" required className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Téléphone (facultatif)</label>
          <input type="tel" name="buyer_phone" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
        </div>
      </div>

      {/* Minor toggle */}
      <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
        <input type="checkbox" name="is_minor" checked={isMinor} onChange={(e) => setIsMinor(e.target.checked)} className="rounded" />
        Je suis mineur(e)
      </label>

      {isMinor && (
        <div className="space-y-3 bg-amber-50 rounded-xl p-4 border border-amber-100">
          <p className="text-xs text-amber-700">Un email de confirmation sera envoyé à ton parent ou tuteur avant la finalisation.</p>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email du parent / tuteur</label>
            <input type="email" name="parent_email" required={isMinor} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Téléphone du parent / tuteur (facultatif)</label>
            <input type="tel" name="parent_phone" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500" />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-lotus-600 text-white text-sm font-medium px-5 py-3 hover:bg-lotus-700 transition disabled:opacity-50"
      >
        {isPending ? "Envoi en cours…" : "Envoyer ma présélection"}
      </button>
    </form>
  );
}
