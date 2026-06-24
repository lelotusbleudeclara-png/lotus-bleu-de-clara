// Le Lotus Bleu — envoi automatique des emails
// À coller dans script.google.com (projet lié à lelotusbleudeclara@gmail.com)

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action || "new_preselection";

  if (action === "new_preselection") {
    sendInternalNotification(data);
    if (data.is_minor) {
      sendParentConfirmationRequest(data);
    }
  } else if (action === "transaction_completed") {
    sendPurchaseConfirmation(data);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatItems(items) {
  return items
    .map(function (it) {
      return "- " + it.name + " — " + it.price + " €";
    })
    .join("\n");
}

// 2.1 — Email de notification interne (Clara et adulte référent)
function sendInternalNotification(data) {
  var itemsList = formatItems(data.items);
  var body =
    "Bonjour,\n\n" +
    "Une nouvelle présélection vient d'être envoyée sur Le Lotus Bleu.\n\n" +
    "Client : " + data.buyer_name + "\n" +
    "Contact : " + data.buyer_email + (data.buyer_phone ? " / " + data.buyer_phone : "") + "\n" +
    "Mineur : " + (data.is_minor ? "Oui" : "Non") + "\n";

  if (data.is_minor) {
    body += "Email du parent ou tuteur indiqué : " + data.parent_email + "\n";
    body += "Téléphone du parent ou tuteur indiqué : " + (data.parent_phone || "—") + "\n";
  }

  body +=
    "\nBijoux sélectionnés :\n" + itemsList + "\n\n" +
    "Montant total : " + data.total + " €\n\n";

  if (data.is_minor) {
    body +=
      "Statut : en attente de la confirmation du parent ou tuteur. " +
      "La commande ne pourra être finalisée qu'à réception de son email de confirmation à l'adresse de contact.\n\n";
  }

  body += "Le détail complet est consultable dans l'interface vendeur.";

  GmailApp.sendEmail(
    "lelotusbleudeclara@gmail.com",
    "Nouvelle présélection reçue – " + data.buyer_name,
    body
  );
}

// 2.2 — Email automatique de demande de confirmation parentale
function sendParentConfirmationRequest(data) {
  var itemsList = formatItems(data.items);
  var body =
    "Bonjour,\n\n" +
    "Quelle joie : " + data.buyer_name + " a repéré un ou plusieurs bijoux dans mon petit atelier, Le Lotus Bleu ! Voici ce qui a été sélectionné :\n\n" +
    itemsList + "\n\n" +
    "Montant total : " + data.total + " €\n\n" +
    "Comme je suis (encore) mineure, mes parents veillent au grain sur chaque commande : rien n'est jamais finalisé sans leur feu vert. " +
    "Pas d'inquiétude côté paiement non plus : aucune carte bancaire en vue ici, tout se règle en main propre et en liquide, lors d'un rendez-vous dans un lieu public, " +
    "avec une photo souvenir (sans visage, promis) envoyée par email à la fin de la transaction.\n\n" +
    "Pour confirmer cette commande, il suffit de nous renvoyer le message ci-dessous, complété, depuis votre propre adresse email, à l'adresse lelotusbleudeclara@gmail.com :\n\n" +
    "— — — — — — — — — — — — — — — — — — — —\n" +
    "Je soussigné(e) [votre nom], parent ou tuteur de " + data.buyer_name + ", confirme avoir connaissance de cette commande et donne mon accord pour qu'elle soit finalisée.\n" +
    "Date : [date]\n" +
    "— — — — — — — — — — — — — — — — — — — —\n\n" +
    "Sans ce petit mot de votre part, la commande reste sagement en attente.\n\n" +
    "Pour toute question, vous pouvez nous écrire à cette même adresse.\n\n" +
    "Merci beaucoup pour votre confiance,\nClara, Le Lotus Bleu";

  GmailApp.sendEmail(
    data.parent_email,
    "Confirmation nécessaire pour la commande de " + data.buyer_name + " – Le Lotus Bleu",
    body
  );
}

// 2.3 — Email de preuve de transaction (sera déclenché plus tard par l'interface vendeur, tâche #18)
function sendPurchaseConfirmation(data) {
  var itemsList = formatItems(data.items);
  var body =
    "Bonjour " + data.buyer_name + ",\n\n" +
    "Merci beaucoup pour votre achat ! Une commande comme la vôtre m'encourage à continuer dans cette démarche de fabrication artisanale qui me passionne " +
    "(et ça fait toujours un peu battre le cœur de la créatrice en herbe que je suis).\n\n" +
    "Voici le récapitulatif, bien carré, de votre achat :\n\n" +
    "Bijou(x) : " + itemsList + "\n" +
    "Montant payé : " + data.total + " €\n" +
    "Date et heure : " + data.transacted_at + "\n" +
    "Lieu de la remise : " + (data.location || "—") + "\n\n" +
    "Vous trouverez en pièce jointe la photo de preuve de la remise.\n\n";

  if (data.is_minor) {
    body += "Une copie de cet email est également envoyée à votre parent ou tuteur.\n\n";
  }

  body += "Merci encore et à très bientôt sur Le Lotus Bleu !\n\nClara";

  var options = {};
  if (data.proof_photo_base64) {
    var blob = Utilities.newBlob(
      Utilities.base64Decode(data.proof_photo_base64),
      data.proof_photo_mimetype || "image/jpeg",
      "preuve.jpg"
    );
    options.attachments = [blob];
  }

  var recipients = data.buyer_email;
  if (data.is_minor && data.parent_email) {
    recipients += "," + data.parent_email;
  }

  GmailApp.sendEmail(recipients, "Confirmation de votre achat – Le Lotus Bleu", body, options);
}
