"use client";
import { useState } from "react";
import { deleteTransaction } from "@/lib/actions/transactions";

export default function DeleteTransactionButton({ id }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="text-sm text-red-400 hover:text-red-600 transition">
        Supprimer cette transaction
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <p className="text-stone-800 font-medium">Supprimer cette transaction ?</p>
            <p className="text-sm text-stone-500">La photo de preuve sera également supprimée. Action irréversible.</p>
            <div className="flex gap-3">
              <form action={deleteTransaction.bind(null, id)} className="flex-1">
                <button type="submit"
                  className="w-full rounded-full bg-red-600 text-white text-sm font-medium px-5 py-2 hover:bg-red-700 transition">
                  Oui, supprimer
                </button>
              </form>
              <button type="button" onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-stone-300 text-stone-700 text-sm font-medium px-5 py-2 hover:bg-stone-50 transition">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
