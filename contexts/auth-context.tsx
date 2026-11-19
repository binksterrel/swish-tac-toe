"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabasePublic } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signUpWithEmail: (email: string, password: string, username: string, avatarUrl?: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  supabase: typeof supabasePublic
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  // Id of the user the server last rendered for; lets us skip pointless refreshes
  const lastUserId = useRef<string | null>(null)

  useEffect(() => {
    // Check active session
    supabasePublic.auth.getSession().then(({ data: { session } }) => {
      lastUserId.current = session?.user?.id ?? null
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for changes
    const { data: { subscription } } = supabasePublic.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
        // Token refreshes and tab re-focus re-emit events with the same user:
        // only ask the server for fresh data when someone signs in or out.
        const nextId = session?.user?.id ?? null
        if (nextId !== lastUserId.current) {
          lastUserId.current = nextId
          router.refresh()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const signInWithGoogle = async () => {
    await supabasePublic.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`
      }
    })
    console.log("Signing in with redirect to:", window.location.origin)
  }

  const signUpWithEmail = async (email: string, password: string, username: string, avatarUrl?: string) => {
    const { error } = await supabasePublic.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username,
          avatar_url: avatarUrl
        }
      }
    })
    if (error) throw error
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabasePublic.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
  }

  const signOut = async () => {
    await supabasePublic.auth.signOut()
    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOut, supabase: supabasePublic }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
