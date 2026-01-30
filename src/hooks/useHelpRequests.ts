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

      // Vérifier s'il existe déjà une demande pending sur cette connection (peu importe qui l'a faite)
      const { data: existingRequests } = await supabase
        .from('help_requests')
        .select('id, requester_id')
        .eq('connection_id', connectionId)
        .eq('status', 'pending')

      if (existingRequests && existingRequests.length > 0) {
        const isMyRequest = existingRequests[0].requester_id === user.id
        if (isMyRequest) {
          throw new Error('Tu as déjà une demande en attente')
        } else {
          throw new Error("Une demande d'aide est déjà en cours sur cette conversation")
        }
      }

      const { error } = await supabase.from('help_requests').insert({
        connection_id: connectionId,
        requester_id: user.id,
        skill_requested: skill,
        status: 'pending',
      })

      if (error) throw error
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
      const { error } = await supabase
        .from('help_requests')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId)

      if (error) throw error
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
