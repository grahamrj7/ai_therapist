import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyD9609I3S0Q9fnyNCLEvAXn9E7cCmNdYQs",
  authDomain: "ai-therapist-d691c.firebaseapp.com",
  projectId: "ai-therapist-d691c",
  storageBucket: "ai-therapist-d691c.firebasestorage.app",
  messagingSenderId: "268122225527",
  appId: "1:268122225527:web:a6c08e5008c50b3edaff72",
  measurementId: "G-GQ2R5D0DXH"
}

const app = initializeApp(firebaseConfig)

let analytics = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
export const logOut = () => signOut(auth)
export const onAuthChange = (callback: Parameters<typeof onAuthStateChanged>[1]) => onAuthStateChanged(auth, callback)

export { app, analytics, auth }
