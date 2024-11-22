import { credential, messaging } from "firebase-admin";
import { initializeApp, ServiceAccount } from "firebase-admin/app";
import { env } from "./env";

const serviceAccount: ServiceAccount = {
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_CLIENT_EMAIL,
  privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
};

export const firebaseApp = initializeApp({
  credential: credential.cert(serviceAccount),
});
