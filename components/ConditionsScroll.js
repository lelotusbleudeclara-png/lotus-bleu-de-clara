"use client";

import { useRef, useState } from "react";

export default function ConditionsScroll({ onReachedEnd }) {
  const ref = useRef(null);
  const [reachedEnd, setReachedEnd] = useState(false);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 16;
    if (atBottom && !reachedEnd) {
      setReachedEnd(true);
      onReachedEnd?.();
    }
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="h-48 overflow-y-auto border border-stone-200 rounded-lg p-4 text-sm text-stone-600 bg-stone-50 space-y-3"
    >
      <p className="italic">
        Le Lotus Bleu est un catalogue de bijoux artisanaux réalisés par Clara. Chaque
        commande est suivie par l&apos;adulte référent du projet (un parent de Clara), qui reste
        l&apos;interlocuteur final pour toute question.
      </p>
      <p className="italic">
        Si vous êtes mineur(e), vous devez indiquer l&apos;adresse email d&apos;un parent ou tuteur.
        Un email automatique lui sera envoyé avec un modèle de message à nous renvoyer pour
        confirmer votre commande. Sans cette confirmation envoyée par votre parent ou tuteur, votre
        commande ne pourra pas être finalisée.
      </p>
      <p className="italic">
        Si vous êtes une personne majeure que Clara et sa famille ne connaissent pas, c&apos;est
        l&apos;adulte référent qui assurera la remise du bijou, et non Clara elle-même. Si vous
        êtes mineur(e), un parent devra être présent avec vous lors du rendez-vous.
      </p>
      <p className="italic">
        Lors de la remise du bijou, une photo sera prise : elle montrera le bijou dans votre main
        et votre tenue, mais jamais votre visage. Cette photo, ainsi que le lieu et l&apos;heure de
        la remise, vous seront envoyés par email comme preuve d&apos;achat (et à votre parent ou
        tuteur si vous êtes mineur(e)).
      </p>
      <p className="italic">
        Aucun paiement en ligne n&apos;est proposé : le règlement se fait uniquement en main propre
        et en liquide, lors du rendez-vous de remise.
      </p>
      <p className="text-xs text-stone-400 pt-2">— Fin des conditions —</p>
    </div>
  );
}
