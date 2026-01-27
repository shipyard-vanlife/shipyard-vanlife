import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { HelpRequest } from '../types/chat'

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

export function useCreateHelpRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ connectionId, skill }: { connectionId: string; skill: string }): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser()
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
          throw new Error('Une demande d\'aide est déjà en cours sur cette conversation')
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: helpRequestKeys.byConnection(variables.connectionId),
      })
    },
  })
}

export function useRespondToHelpRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ requestId, status, connectionId }: { requestId: string; status: 'accepted' | 'declined'; connectionId: string }): Promise<void> => {
      const { error } = await supabase
        .from('help_requests')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: helpRequestKeys.byConnection(variables.connectionId),
      })
    },
  })
}

export function useCancelHelpRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ requestId, connectionId }: { requestId: string; connectionId: string }): Promise<void> => {
      const { error } = await supabase
        .from('help_requests')
        .delete()
        .eq('id', requestId)
        .eq('status', 'pending')

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: helpRequestKeys.byConnection(variables.connectionId),
      })
    },
  })
}
