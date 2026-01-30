import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'

type SignInInput = {
  email: string
  password: string
}

type SignUpInput = {
  email: string
  password: string
}

export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: SignInInput): Promise<void> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
  })
}

export function useSignUp() {
  return useMutation({
    mutationFn: async ({ email, password }: SignUpInput): Promise<void> => {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      // Clear all React Query cache on sign out
      queryClient.clear()
    },
  })
}
