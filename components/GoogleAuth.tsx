// components/GoogleAuth.tsx
"use client"

import { googleAuth } from "../lib/firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"


export default function GoogleAuth() {
  const provider = new GoogleAuthProvider()
  const data = await signInWithPopup(googleAuth, provider)

  return <h1>Login</h1>
}   