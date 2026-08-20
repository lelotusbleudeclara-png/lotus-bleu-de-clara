"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "lotus_conditions_library";

export default function ConditionsWithLibrary({ defaultValue }) {
  const [value, setValue] = useState(defaultValue || "");
  const [templates, setTemplates] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [newText, setNewText] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    try { setTemplates(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch {}
  }, []);

  function saveTemplate() {
    if (!newText.trim()) return;
    const entry = { id: Date.now(), label: newLabel.trim() || newText.slice(0, 30), text: newText.trim() };
    const updated = [...templates, entry];
    setTemplates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewLabel(""); setNewText(""); setShowAdd(false);
  }

  function deleteTemplate(id) {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function applyTemplate(text) {
    setValue(prev => prev ? prev + "\n" + text : text);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-700">
        Conditions d&apos;utilisation
      </label>
      <textarea
        name="conditions_utilisation"
        rows={3}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Ex. Ne pas mouiller, d&#233;conseill&#233; aux moins de 3 ans..."
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lotus-500"
      />

      {/* Bibliothèque */}
      <div className="bg-stone-50 rounded-xl border border-stone-200 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Biblioth&#232;que</p>
          <button type="button" onClick={() => setShowAdd(!showAdd)}
            className="text-xs text-lotus-700 hover:text-lotus-900">
            {showAdd ? "Annuler" : "+ Ajouter un mod&#232;le"}
          </button>
        </div>

        {showAdd && (
          <div className="space-y-2 bg-white rounded-lg p-3 border border-stone-200">
            <input type="text" placeholder="Nom du mod&#232;le (facultatif)" value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-lotus-500" />
            <textarea placeholder="Texte des conditions..." value={newText}
              onChange={e => setNewText(e.target.value)} rows={3}
              className="w-full rounded-lg border border-stone-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-lotus-500" />
            <button type="button" onClick={saveTemplate}
              className="w-full rounded-full bg-lotus-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-lotus-700 transition">
              Sauvegarder
            </button>
          </div>
        )}

        {templates.length === 0 && !showAdd && (
          <p className="text-xs text-stone-400 italic">Aucun mod&#232;le enregistr&#233; — cliquez sur &quot;+ Ajouter&quot; pour commencer.</p>
        )}

        <div className="space-y-1">
          {templates.map(t => (
            <div key={t.id} className="flex items-center gap-2 bg-white rounded-lg border border-stone-200 px-3 py-2">
              <button type="button" onClick={() => applyTemplate(t.text)}
                className="flex-1 text-left text-xs text-stone-700 hover:text-lotus-700 transition truncate">
                {t.label}
              </button>
              <button type="button" onClick={() => deleteTemplate(t.id)}
                className="text-stone-300 hover:text-red-500 transition text-xs flex-shrink-0">
                &#10005;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
