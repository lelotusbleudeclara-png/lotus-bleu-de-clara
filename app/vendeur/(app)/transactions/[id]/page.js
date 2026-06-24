import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function TransactionDetailPage({ params }) {
  const { id } = await params;

  const { data: transaction, error } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !transaction) notFound();

  const { data: signed } = await supabaseAdmin.storage
    .from("transaction-proofs")
    .createSignedUrl(transaction.proof_photo_path, 60 * 10); // 10 minutes

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
          {transaction.buyer_name}
        </h1>
        <Link href="/vendeur/transactions" className="text-sm text-stone-500 hover:text-stone-700">
          ← Retour
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2 text-sm">
        <p><span className="text-stone-400">Email :</span> {transaction.buyer_email}</p>
        {transaction.is_minor && (
          <>
            <p className="text-amber-600 font-medium">Acheteur·se mineur·e</p>
            {transaction.parent_email && (
              <p><span className="text-stone-400">Email parent :</span> {transaction.parent_email}</p>
            )}
          </>
        )}
        <p><span className="text-stone-400">Date et heure de remise :</span> {new Date(transaction.transacted_at).toLocaleString("fr-FR")}</p>
        {transaction.location && (
          <p><span className="text-stone-400">Lieu :</span> {transaction.location}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h2 className="text-sm font-medium text-stone-700 mb-3">Articles</h2>
        <ul className="divide-y divide-stone-100 text-sm">
          {(transaction.items || []).map((item, i) => (
            <li key={i} className="py-2 flex justify-between">
              <span>{item.name}</span>
              <span className="text-stone-600">{Number(item.price).toFixed(2)} €</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between pt-3 mt-2 border-t border-stone-200 font-medium">
          <span>Total payé</span>
          <span>{Number(transaction.total).toFixed(2)} €</span>
        </div>
      </div>

      {signed?.signedUrl && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h2 className="text-sm font-medium text-stone-700 mb-3">Photo de preuve</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={signed.signedUrl} alt="Preuve de remise" className="rounded-lg max-h-80 w-auto" />
        </div>
      )}
    </div>
  );
}
