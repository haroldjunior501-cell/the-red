/**
 * Test Storage + Firestore (Admin SDK, sans règles client).
 * Usage:
 *   $env:FIREBASE_SERVICE_ACCOUNT = Get-Content -Raw -Path "C:\...\goalya-firebase-adminsdk-....json"
 *   node scripts/testFirebasePublish.mjs
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT ?? '{}');
if (!sa.project_id) {
  console.error('FIREBASE_SERVICE_ACCOUNT manquant ou JSON invalide');
  process.exit(1);
}

initializeApp({ credential: cert(sa), storageBucket: `${sa.project_id}.firebasestorage.app` });
const db = getFirestore('default');
const bucket = getStorage().bucket();

const uid = 'k8dl8cJmKrejCJgxEoNkjIBnno73';
const user = await getAuth().getUser(uid);
console.log('User:', user.email, 'claims:', user.customClaims);

const testPath = `stories/test/${Date.now()}.txt`;
const file = bucket.file(testPath);
await file.save('goalya-test', { contentType: 'text/plain', metadata: { cacheControl: 'public,max-age=3600' } });
const [videoUrl] = await file.getSignedUrl({ action: 'read', expires: '2099-01-01' });
console.log('Storage OK:', testPath);

const storyId = `story_test_${Date.now()}`;
await db.collection('content_stories').doc(storyId).set({
  videoUrl,
  thumbnailUrl: videoUrl,
  type: 'highlight',
  label: 'Test admin script',
  matchId: 'test',
  country: 'FRA',
  chapter: "Chapitre 0 · Avant le coup d'envoi",
  duration: 10,
  publishedAt: new Date(),
  views: 0,
  isActive: true,
  postedBy: 'testFirebasePublish.mjs',
});
console.log('Firestore OK:', storyId);
await file.delete();
await db.collection('content_stories').doc(storyId).delete();
console.log('Cleanup OK — backend Firebase fonctionne.');
