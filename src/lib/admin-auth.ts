// Admin JWT — Web Crypto (Edge Runtime compatible)

const ALG = { name: 'HMAC', hash: 'SHA-256' };
const enc = new TextEncoder();

function b64url(s: string) {
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function fromb64url(s: string) {
  return atob(s.replace(/-/g, '+').replace(/_/g, '/'));
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), ALG, false, ['sign', 'verify']);
}

export async function createAdminToken(email: string, secret: string): Promise<string> {
  const header  = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ email, iat: Date.now(), exp: Date.now() + 8 * 3600 * 1000 }));
  const data    = `${header}.${payload}`;
  const key     = await getKey(secret);
  const sigBuf  = await crypto.subtle.sign(ALG, key, enc.encode(data));
  const sig     = b64url(String.fromCharCode(...new Uint8Array(sigBuf)));
  return `${data}.${sig}`;
}

export async function verifyAdminToken(token: string, secret: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [header, payload, sig] = parts;
  try {
    const { exp } = JSON.parse(fromb64url(payload));
    if (Date.now() > exp) return false;
    const key     = await getKey(secret);
    const sigBytes = Uint8Array.from(fromb64url(sig), c => c.charCodeAt(0));
    return await crypto.subtle.verify(ALG, key, sigBytes, enc.encode(`${header}.${payload}`));
  } catch {
    return false;
  }
}
