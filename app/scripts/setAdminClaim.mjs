/**
 * Usage (une fois) :
 * GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/setAdminClaim.mjs UID_ADMIN
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node scripts/setAdminClaim.mjs <firebase-auth-uid>');
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT ?? '{}')) });

await getAuth().setCustomUserClaims(uid, { admin: true });
console.log(`admin:true défini pour ${uid}`);
