import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createTransaction } from "@/lib/actions/transactions";

export default async function NouvelleTransactionPage({ searchParams }) {
  const params = await searchParams;
  const preselectionId = params?.preselection || "";

  let preselection = null;
  if (preselectionId) {
    const { data } = await supabaseAdmin
      .from("preselections")
      .select("*")
      .eq("id", preselectionId)
      .single();
    preselection = data;
  }

  const itemsJson = JSON.stringify(preselection?.items || []);

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl text-lotus-800" style={{ fontFamily: "var(--font-heading)" }}>
        Valider une transaction
      </h1>
      <p className="text-sm text-stone-500">
        À remplir au moment de la remise en main propre, avec une photo de preuve (sans visage).
      </p>

      <form
        action={createTransaction}
        className="space-y-4 bg-white rounded-2xl border border-stone-200 p-5"
      >
        <input type="hidden" name="preselection_id" value={preselectionId} />
        <input type="hidden" name="items_json" defaultValue={itemsJson} />

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Nom de l&apos;acheteur·se</label>
          <input
            type="text"
            name="buyer_name"
            required
            defaultValue={preselection?.buyer_name || ""}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
          <input
            type="email"
            name="buyer_email"
            required
            defaultValue={preselection?.buyer_email || ""}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            name="is_minor"
            defaultChecked={preselection?.is_minor || false}
            className="rounded"
          />
          Acheteur·se mineur·e
        </label>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Email du parent ou tuteur (si mineur·e)
          </label>
          <input
            type="email"
            name="parent_email"
            defaultValue={preselection?.parent_email || ""}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
          />
        </div>

        {preselection?.items && preselection.items.length > 0 && (
          <div className="bg-lotus-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-stone-700 mb-1">Articles de la présélection :</p>
            <ul className="space-y-0.5">
              {preselection.items.map((item, i) => (
                <li key={i} className="flex justify-between text-stone-600">
                  <span>{item.name}</span>
                  <span>{Number(item.price).toFixed(2)} €</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Montant total payé (€)</label>
          <input
            type="text"
            name="total"
            required
            defaultValue={preselection?.total || ""}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Lieu de la remise</label>
          <input
            type="text"
            name="location"
            placeholder="Ex. devant la médiathèque de..."
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Photo de preuve de la remise (sans visage)
          </label>
          <input type="file" name="proof_photo" accept="image/*" required className="text-sm" />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-lotus-700 text-white text-sm font-medium px-5 py-2.5 hover:bg-lotus-800 transition"
        >
          Enregistrer la transaction et envoyer la confirmation
        </button>
      </form>
    </div>
  );
}
