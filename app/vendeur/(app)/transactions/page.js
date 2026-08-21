export const dynamic = "force-dynamic";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import TransactionsList from "@/components/TransactionsList";

export default async function TransactionsPage() {
  const { data: transactions, error } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .order("transacted_at", { ascending: false });

  if (error) {
    return <p className="text-red-600">Erreur de chargement : {error.message}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
          Historique des transactions
        </h1>
        <Link href="/vendeur/transactions/nouvelle"
          className="rounded-full bg-lotus-600 text-white text-sm font-medium px-4 py-2 hover:bg-lotus-700 transition">
          Nouvelle transaction
        </Link>
      </div>
      <TransactionsList transactions={transactions || []} />
    </div>
  );
}
