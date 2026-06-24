"use client";

import { useEffect } from "react";

export default function RegisterVendeurSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/vendeur/sw.js", { scope: "/vendeur/" })
        .catch((err) => console.warn("Échec d'enregistrement du service worker :", err));
    }
  }, []);

  return null;
}
