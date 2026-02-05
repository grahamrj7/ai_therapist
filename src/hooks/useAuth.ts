import { useState, useEffect } from "react"
import { onAuthChange, signInWithGoogle, logOut } from "@/lib/firebase"

interface User {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Sign in error:", error)
    }
  }

  const signOut = async () => {
    try {
      await logOut()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }
}
