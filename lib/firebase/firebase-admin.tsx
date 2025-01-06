import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

// Admin SDK 초기화
const adminApp = getApps().length === 0 
  ? initializeApp(firebaseAdminConfig, 'admin') 
  : getApp('admin');

const adminAuth = getAuth(adminApp);

export { adminAuth }; 