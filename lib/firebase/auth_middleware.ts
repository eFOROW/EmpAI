import { adminAuth } from "./firebase-admin";
import { headers } from "next/headers";

export async function verifyAuth() {
  try {
    const headersList = headers();
    const token = headersList.get('Authorization')?.split('Bearer ')[1];
    
    if (!token) {
      throw new Error('No token provided');
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid token');
  }
} 