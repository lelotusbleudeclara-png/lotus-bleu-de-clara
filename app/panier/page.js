"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { supabase } from "@/lib/supabaseClient";
import ConditionsScroll from "@/components/ConditionsScroll";

export default function PanierPage() {
  const { items, removeItem, total, clearCart } = useCart();

  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isMinor, setIsMinor] = useState(null); // null = pas encore répondu
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const requiredFieldsOk = useMemo(() => {
    if (items.length === 0) return false;
    if (!name.trim() || !email.trim()) return false;
    if (isMinor === null) return false;
    if (isMinor && (!parentEmail.trim() || !parentPhone.trim())) return false;
    return true;
  }, [items, name, email, isMinor, parentEmail, parentPhone]);

  const canSubmit = requiredFieldsOk && accepted && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    const { error: insertError } = await supabase.from("preselections").insert({
      buyer_name: name.trim(),
      buyer_email: email.trim(),
      buyer_phone: phone.trim() || null,
      is_minor: !!isMinor,
      parent_email: isMinor ? parentEmail.trim() : null,
      parent_phone: isMinor ? parentPhone.trim() : null,
      items: items.map(({ id, name, price }) => ({ product_id: id, name, price })),
      total,
      status: isMinor ? "en_attente_parent" : "nouvelle",
    });

    setSubmitting(false);

    if (insertError) {
      console.error(insertError);
      setError("Une erreur est survenue lors de l'envoi. Merci de réessayer.");
      return;
    }

    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-3">
        <h1 className="text-xl font-semibold text-purple-700">Merci pour votre présélection !</h1>
        <p className="text-stone-600">
          Clara et l&apos;adulte référent du projet ont bien reçu votre demande. Vous serez
          recontacté(e) par email très prochainement.
        </p>
        <Link href="/" className="inline-block mt-4 text-sm text-purple-700 underline">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-3">
        <h1 className="text-xl font-semibold text-stone-700">Votre panier est vide</h1>
        <Link href="/" className="inline-block mt-2 text-sm text-purple-700 underline">
          Découvrir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <section>
        <h1 className="text-xl font-semibold text-stone-800 mb-3">Votre présélection</h1>
        <ul className="divide-y divide-stone-200 border border-stone-200 rounded-lg bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-medium">{Number(item.price).toFixed(2)} €</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-stone-400 hover:text-red-500"
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-between mt-3 font-semibold text-stone-800">
          <span>Total</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-stone-700 mb-2">
          Conditions (merci de lire jusqu&apos;en bas)
        </h2>
        <ConditionsScroll onReachedEnd={() => setScrolledToEnd(true)} />
      </section>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-stone-600 mb-1">Nom et prénom *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-stone-600 mb-1">Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-stone-600 mb-1">Téléphone (facultatif)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <span className="block text-sm text-stone-600 mb-1">Êtes-vous majeur(e) ? *</span>
          <div className="flex gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="majeur"
                checked={isMinor === false}
                onChange={() => setIsMinor(false)}
              />
              Oui
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="majeur"
                checked={isMinor === true}
                onChange={() => setIsMinor(true)}
              />
              Non
            </label>
          </div>
        </div>

        {isMinor && (
          <div className="space-y-4 border-l-2 border-purple-200 pl-4">
            <div>
              <label className="block text-sm text-stone-600 mb-1">
                Email d&apos;un parent ou tuteur *
              </label>
              <input
                type="email"
                required
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-600 mb-1">
                Téléphone d&apos;un parent ou tuteur *
              </label>
              <input
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        <label className="flex items-start gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            disabled={!scrolledToEnd}
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1"
          />
          <span>
            J&apos;accepte les conditions ci-dessus.
            {!scrolledToEnd && (
              <span className="text-stone-400 italic"> (faites défiler le texte jusqu&apos;en bas)</span>
            )}
          </span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-purple-700 text-white py-3 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-800 transition"
        >
          {submitting ? "Envoi en cours..." : "Envoyer ma présélection"}
        </button>
      </form>
    </div>
  );
}
