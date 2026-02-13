import { Session } from '@supabase/supabase-js'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { AuthContextType, User } from '../types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Timeout de sécurité : si Supabase ne répond pas en 5s, on continue quand même
    const timeout = setTimeout(() => {
      console.warn('[AuthProvider] Timeout - forcing loading to false')
      setLoading(false)
    }, 5000)

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout)
      setUser(session?.user ? { id: session.user.id, email: session.user.email || '' } : null)
      setLoading(false)
    }).catch((error) => {
      clearTimeout(timeout)
      console.error('[AuthProvider] Failed to get session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email || '' } : null)
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
