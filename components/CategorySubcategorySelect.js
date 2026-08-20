"use client";

import { useState } from "react";

export default function CategorySubcategorySelect({ categories, subcategories, defaultCategoryId = "", defaultSubcategoryId = "" }) {
  const [categoryId, setCategoryId] = useState(defaultCategoryId);

  const filtered = subcategories.filter((s) => s.category_id === categoryId);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Catégorie <span className="text-red-500">*</span>
        </label>
        <select
          name="category_id"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
        >
          <option value="">— Choisir une catégorie —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {categoryId && filtered.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Sous-catégorie <span className="text-stone-400 text-xs">(facultatif)</span>
          </label>
          <select
            name="subcategory_id"
            defaultValue={defaultSubcategoryId}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
          >
            <option value="">— Sans sous-catégorie —</option>
            {filtered.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {categoryId && filtered.length === 0 && (
        <p className="text-xs text-stone-400 italic">Aucune sous-catégorie pour cette catégorie.</p>
      )}
    </div>
  );
}
