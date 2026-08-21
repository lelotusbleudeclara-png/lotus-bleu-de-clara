"use client";
import { useState } from "react";
import Link from "next/link";
import { deleteTransaction } from "@/lib/actions/transactions";

function ConfirmDeleteModal({ transaction, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
        <p className="text-stone-800 font-medium">Supprimer la transaction de {transaction.buyer_name} ?</p>
        <p className="text-sm text-stone-500">
          {new Date(transaction.transacted_at).toLocaleString("fr-FR")} · {Number(transaction.total).toFixed(2)} €
        </p>
        <p className="text-xs text-stone-400">La photo de preuve sera également supprimée. Action irréversible.</p>
        <div className="flex gap-3">
          <form action={deleteTransaction.bind(null, transaction.id)} className="flex-1">
            <button type="submit"
              className="w-full rounded-full bg-red-600 text-white text-sm font-medium px-5 py-2 hover:bg-red-700 transition">
              Oui, supprimer
            </button>
          </form>
          <button type="button" onClick={onClose}
            className="flex-1 rounded-full border border-stone-300 text-stone-700 text-sm font-medium px-5 py-2 hover:bg-stone-50 transition">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsList({ transactions }) {
  const [toDelete, setToDelete] = useState(null);

  if (!transactions?.length) {
    return <p className="text-stone-500 text-sm p-4">Aucune transaction enregistrée pour le moment.</p>;
  }

  return (
    <>
      {toDelete && <ConfirmDeleteModal transaction={toDelete} onClose={() => setToDelete(null)} />}

      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
        {transactions.map(t => (
          <div key={t.id} className="flex items-center gap-2 px-3 py-3 hover:bg-lotus-50 transition group">
            <Link href={`/vendeur/transactions/${t.id}`} className="flex-1 min-w-0">
              <p className="font-medium text-stone-800">{t.buyer_name}</p>
              <p className="text-xs text-stone-400">
                {new Date(t.transacted_at).toLocaleString("fr-FR")}
                {t.location ? ` · ${t.location}` : ""}
              </p>
            </Link>
            <span className="text-sm text-stone-600 whitespace-nowrap">{Number(t.total).toFixed(2)} €</span>
            <button
              type="button"
              onClick={() => setToDelete(t)}
              className="opacity-0 group-hover:opacity-100 transition text-stone-300 hover:text-red-500 text-lg leading-none px-1"
              title="Supprimer">
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
