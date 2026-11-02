/**
 * Liste les bases Cloud Firestore du projet.
 */
import { initializeApp, cert } from 'firebase-admin/app';

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT ?? '{}');
if (!sa.project_id) {
  console.error('Définis FIREBASE_SERVICE_ACCOUNT (JSON compte de service).');
  process.exit(1);
}

initializeApp({ credential: cert(sa) });

const url = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases`;
const token = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: await createJwt(sa),
  }),
}).then((r) => r.json());

if (!token.access_token) {
  console.error('Auth Google échouée:', token);
  process.exit(1);
}

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${token.access_token}` },
}).then((r) => r.json());

if (res.error) {
  console.error('API:', res.error.message);
  process.exit(1);
}

const dbs = res.databases ?? [];
if (!dbs.length) {
  console.log('Aucune base Firestore sur le projet', sa.project_id);
  console.log('→ Console Firebase → Firestore Database → Créer une base (mode Native).');
} else {
  console.log('Bases Firestore sur', sa.project_id + ':');
  for (const d of dbs) {
    console.log(' -', d.name?.split('/').pop(), '| type:', d.type, '| location:', d.locationId);
  }
}

async function createJwt(sa) {
  const crypto = await import('node:crypto');
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      sub: sa.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform',
    }),
  ).toString('base64url');
  const signInput = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256').update(signInput).sign(sa.private_key, 'base64url');
  return `${signInput}.${sign}`;
}
