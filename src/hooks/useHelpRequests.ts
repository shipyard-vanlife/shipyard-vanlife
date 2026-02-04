import { useQuery } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { HelpRequest } from '../types/chat'
import { useQueryMutation } from './useQueryMutation'

export const helpRequestKeys = {
  all: ['help_requests'] as const,
  byConnection: (connectionId: string) => [...helpRequestKeys.all, connectionId] as const,
}

export function useHelpRequests(connectionId: string) {
  return useQuery({
    queryKey: helpRequestKeys.byConnection(connectionId),
    queryFn: async (): Promise<HelpRequest[]> => {
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as HelpRequest[]) ?? []
    },
    enabled: !!connectionId,
  })
}

interface CreateHelpRequestInput {
  connectionId: string
  skill: string
}

export function useCreateHelpRequest() {
  return useQueryMutation({
    mutationFn: async ({ connectionId, skill }: CreateHelpRequestInput): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // D'abord, annuler automatiquement toute demande pending existante de cet utilisateur sur cette connection
      // Cela évite les conflits avec la contrainte unique (connection_id, requester_id, status)
      const { error: deleteError } = await supabase
        .from('help_requests')
        .delete()
        .eq('connection_id', connectionId)
        .eq('requester_id', user.id)
        .eq('status', 'pending')

      if (deleteError) {
        console.error('Error deleting old pending request:', deleteError)
      }

      // Vérifier s'il existe une demande pending d'une AUTRE personne
      const { data: existingRequests } = await supabase
        .from('help_requests')
        .select('id, requester_id')
        .eq('connection_id', connectionId)
        .eq('status', 'pending')
        .neq('requester_id', user.id)

      if (existingRequests && existingRequests.length > 0) {
        throw new Error("Une demande d'aide est déjà en cours sur cette conversation")
      }

      // Créer la nouvelle demande
      const { error } = await supabase.from('help_requests').insert({
        connection_id: connectionId,
        requester_id: user.id,
        skill_requested: skill,
        status: 'pending',
      })

      if (error) {
        // Si c'est une erreur de duplicate key malgré tout
        if (error.code === '23505') {
          throw new Error("Une demande d'aide est déjà en cours. Réessaye dans quelques secondes.")
        }
        throw error
      }
    },
    invalidateKeys: [
      (vars: CreateHelpRequestInput) => helpRequestKeys.byConnection(vars.connectionId),
    ],
  })
}

interface RespondToHelpRequestInput {
  requestId: string
  status: 'accepted' | 'declined'
  connectionId: string
}

export function useRespondToHelpRequest() {
  return useQueryMutation({
    mutationFn: async ({ requestId, status }: RespondToHelpRequestInput): Promise<void> => {
      console.log('🔵 Responding to help request:', { requestId, status })

      // Récupérer la demande actuelle
      const { data: currentRequest, error: fetchError } = await supabase
        .from('help_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      console.log('🔵 Current request before update:', currentRequest, fetchError)

      if (fetchError || !currentRequest) {
        throw new Error('Demande introuvable')
      }

      // WORKAROUND: Supprimer les anciennes demandes du même utilisateur avec le même status
      // pour éviter la contrainte unique (connection_id, requester_id, status)
      const { error: deleteError } = await supabase
        .from('help_requests')
        .delete()
        .eq('connection_id', currentRequest.connection_id)
        .eq('requester_id', currentRequest.requester_id)
        .eq('status', status)
        .neq('id', requestId)

      if (deleteError) {
        console.warn('⚠️ Error deleting old requests:', deleteError)
      }

      // Maintenant update la demande
      const { data, error } = await supabase
        .from('help_requests')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()

      console.log('🔵 Response result:', { data, error })

      if (error) {
        console.error('🔴 Error responding to help request:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw error
      }
    },
    invalidateKeys: [
      (vars: RespondToHelpRequestInput) => helpRequestKeys.byConnection(vars.connectionId),
    ],
  })
}

interface CancelHelpRequestInput {
  requestId: string
  connectionId: string
}

export function useCancelHelpRequest() {
  return useQueryMutation({
    mutationFn: async ({ requestId }: CancelHelpRequestInput): Promise<void> => {
      const { error } = await supabase
        .from('help_requests')
        .delete()
        .eq('id', requestId)
        .eq('status', 'pending')

      if (error) throw error
    },
    invalidateKeys: [
      (vars: CancelHelpRequestInput) => helpRequestKeys.byConnection(vars.connectionId),
    ],
  })
}
