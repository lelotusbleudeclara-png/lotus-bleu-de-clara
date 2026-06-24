// Authentification "mot de passe unique partagé" pour l'interface vendeur (/vendeur).
// Compatible Edge (middleware) et Node (server actions) : utilise uniquement Web Crypto
// (crypto.subtle) et btoa/atob, pas de module Node spécifique.

export const SESSION_COOKIE_NAME = "lotus_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 jours

function bytesToBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(b64url) {
  const base64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET n'est pas défini dans les variables d'environnement.");
  }
  return secret;
}

async function importHmacKey() {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecretKey()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signPayload(payloadB64) {
  const key = await importHmacKey();
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  return bytesToBase64Url(new Uint8Array(signature));
}

/**
 * Crée un jeton de session signé, valable SESSION_MAX_AGE_SECONDS.
 */
export async function createSessionToken() {
  const payload = {
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encoder = new TextEncoder();
  const payloadB64 = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await signPayload(payloadB64);
  return `${payloadB64}.${signature}`;
}

/**
 * Vérifie un jeton de session (signature + expiration).
 * Retourne true si valide, false sinon.
 */
export async function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  try {
    const expectedSignature = await signPayload(payloadB64);
    if (expectedSignature !== signature) return false;

    const decoder = new TextDecoder();
    const payload = JSON.parse(decoder.decode(base64UrlToBytes(payloadB64)));
    if (!payload.exp || Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Compare le mot de passe fourni au mot de passe vendeur partagé.
 */
export function checkPassword(password) {
  const expected = process.env.SELLER_PASSWORD;
  if (!expected) return false;
  return typeof password === "string" && password === expected;
}
