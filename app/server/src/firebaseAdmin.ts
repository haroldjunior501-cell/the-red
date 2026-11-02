import { readFileSync } from 'node:fs';
import admin from 'firebase-admin';

let initialized = false;

function databaseUrlForProject(projectId: string): string {
  const fromEnv = process.env.FIREBASE_DATABASE_URL?.trim();
  if (fromEnv) return fromEnv;
  return `https://${projectId}-default-rtdb.firebaseio.com`;
}

export function getAdmin() {
  if (!initialized) {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
    const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();

    if (json) {
      const cred = JSON.parse(json) as admin.ServiceAccount & { project_id?: string };
      const projectId = cred.project_id ?? cred.projectId;
      admin.initializeApp({
        credential: admin.credential.cert(cred),
        ...(projectId ? { databaseURL: databaseUrlForProject(projectId) } : {}),
      });
    } else if (path) {
      const cred = JSON.parse(readFileSync(path, 'utf8')) as admin.ServiceAccount & {
        project_id?: string;
      };
      const projectId = cred.project_id ?? cred.projectId;
      admin.initializeApp({
        credential: admin.credential.cert(cred),
        ...(projectId ? { databaseURL: databaseUrlForProject(projectId) } : {}),
      });
    } else {
      admin.initializeApp();
    }
    initialized = true;
  }
  return admin;
}

export function getFirestore() {
  return getAdmin().firestore();
}

export function getAuth() {
  return getAdmin().auth();
}

export function getDatabase() {
  return getAdmin().database();
}
