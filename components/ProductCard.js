"use client";

import { useCart } from "@/lib/cart-context";

export default function ProductCard({ product }) {
  const { items, addItem, removeItem } = useCart();
  const inCart = items.some((p) => p.id === product.id);
  const photo = product.product_photos?.[0]?.storage_path;

  return (
    <div className="border border-stone-200 rounded-xl bg-white overflow-hidden flex flex-col">
      <div className="aspect-square bg-stone-100 flex items-center justify-center text-stone-300 text-sm">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          "Photo à venir"
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col gap-1">
        <h3 className="font-medium text-stone-800">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-stone-500 line-clamp-3">{product.description}</p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="font-semibold text-purple-700">{Number(product.price).toFixed(2)} €</span>
          {!product.in_stock ? (
            <span className="text-xs text-stone-400 italic">Rupture de stock</span>
          ) : inCart ? (
            <button
              onClick={() => removeItem(product.id)}
              className="text-xs px-3 py-1.5 rounded-full border border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Retirer
            </button>
          ) : (
            <button
              onClick={() => addItem(product)}
              className="text-xs px-3 py-1.5 rounded-full bg-purple-700 text-white hover:bg-purple-800"
            >
              Ajouter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
