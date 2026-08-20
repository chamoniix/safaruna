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

export type AdminTokenPayload = {
  email: string
  iat: number
  exp: number
  adminId?: string
  sessionId?: string
  role?: 'SUPERADMIN' | 'ADMIN'
}

export type IndividualAdminTokenPayload = AdminTokenPayload & {
  adminId: string
  sessionId: string
  role: 'SUPERADMIN' | 'ADMIN'
}

export function isIndividualAdminToken(
  payload: AdminTokenPayload | null,
): payload is IndividualAdminTokenPayload {
  return Boolean(
    payload
    && typeof payload.adminId === 'string' && payload.adminId.length > 0
    && typeof payload.sessionId === 'string' && payload.sessionId.length > 0
    && (payload.role === 'SUPERADMIN' || payload.role === 'ADMIN'),
  )
}

export async function createAdminToken(
  email: string,
  secret: string,
  identity?: { adminId: string; sessionId: string; role: 'SUPERADMIN' | 'ADMIN' },
): Promise<string> {
  const header  = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ email, ...identity, iat: Date.now(), exp: Date.now() + 8 * 3600 * 1000 }));
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

export async function readVerifiedAdminToken(
  token: string,
  secret: string,
): Promise<AdminTokenPayload | null> {
  if (!await verifyAdminToken(token, secret)) return null;
  try {
    const payload = JSON.parse(fromb64url(token.split('.')[1])) as AdminTokenPayload;
    if (typeof payload.email !== 'string' || typeof payload.iat !== 'number' || typeof payload.exp !== 'number') return null;
    return payload;
  } catch {
    return null;
  }
}
