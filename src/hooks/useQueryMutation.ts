import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query'

/**
 * Configuration for invalidation/refetch keys.
 * Can be a static key or a function that derives the key from mutation variables.
 */
type KeyConfig<TVariables> = QueryKey | ((variables: TVariables) => QueryKey)

/**
 * Configuration for setting query data directly after mutation.
 */
interface SetQueryDataConfig<TData, TVariables> {
  key: KeyConfig<TVariables>
  data: TData | ((oldData: unknown) => unknown) | null
}

/**
 * Options for useQueryMutation hook.
 * Extends standard useMutation options with declarative cache management.
 */
interface QueryMutationOptions<TData, TError, TVariables, TContext>
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> {
  /** The mutation function */
  mutationFn: (variables: TVariables) => Promise<TData>
  /** Query keys to invalidate on success (triggers refetch when query is active) */
  invalidateKeys?: KeyConfig<TVariables>[]
  /** Query keys to refetch immediately on success */
  refetchKeys?: KeyConfig<TVariables>[]
  /** Directly set query data on success (for optimistic updates or clearing) */
  setQueryData?: SetQueryDataConfig<TData, TVariables>
  /** Clear all queries on success (for logout/delete account scenarios) */
  clearAll?: boolean
}

/**
 * Resolves a key config to an actual query key.
 */
function resolveKey<TVariables>(keyConfig: KeyConfig<TVariables>, variables: TVariables): QueryKey {
  return typeof keyConfig === 'function' ? keyConfig(variables) : keyConfig
}

/**
 * Factory hook for creating mutations with declarative cache management.
 *
 * Reduces boilerplate by handling common patterns:
 * - Single/multiple key invalidation
 * - Dynamic key invalidation based on mutation variables
 * - Immediate refetch of specific queries
 * - Direct cache manipulation
 * - Full cache clear (for logout scenarios)
 *
 * @example
 * // Simple invalidation
 * export function useUpdateProfile() {
 *   return useQueryMutation({
 *     mutationFn: async (input) => { ... },
 *     invalidateKeys: [profileKeys.my()],
 *   })
 * }
 *
 * @example
 * // Dynamic invalidation based on variables
 * export function useSendMessage() {
 *   return useQueryMutation({
 *     mutationFn: async (input) => { ... },
 *     invalidateKeys: [(vars) => messageKeys.infinite(vars.connectionId)],
 *   })
 * }
 *
 * @example
 * // Multiple invalidations
 * export function useAddStage() {
 *   return useQueryMutation({
 *     mutationFn: async (input) => { ... },
 *     invalidateKeys: [tripKeys.all],
 *   })
 * }
 *
 * @example
 * // With direct cache update
 * export function useDeleteProfile() {
 *   return useQueryMutation({
 *     mutationFn: async () => { ... },
 *     invalidateKeys: [profileKeys.all, ['trips']],
 *     setQueryData: { key: profileKeys.my(), data: null },
 *   })
 * }
 *
 * @example
 * // Clear all cache (logout)
 * export function useDeleteAccount() {
 *   return useQueryMutation({
 *     mutationFn: async () => { ... },
 *     clearAll: true,
 *   })
 * }
 */
export function useQueryMutation<
  TData = void,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>({
  mutationFn,
  invalidateKeys = [],
  refetchKeys = [],
  setQueryData,
  clearAll = false,
  onSuccess,
  ...options
}: QueryMutationOptions<TData, TError, TVariables, TContext>) {
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    onSuccess: async (data, variables, context) => {
      // Clear all queries first if requested (logout/delete account)
      if (clearAll) {
        queryClient.clear()
      } else {
        // Invalidate specified keys (marks as stale, refetches if active)
        for (const keyConfig of invalidateKeys) {
          const key = resolveKey(keyConfig, variables)
          await queryClient.invalidateQueries({ queryKey: key })
        }

        // Immediately refetch specified keys
        for (const keyConfig of refetchKeys) {
          const key = resolveKey(keyConfig, variables)
          await queryClient.refetchQueries({ queryKey: key })
        }

        // Set query data directly if configured
        if (setQueryData) {
          const key = resolveKey(setQueryData.key, variables)
          if (typeof setQueryData.data === 'function') {
            queryClient.setQueryData(key, setQueryData.data)
          } else {
            queryClient.setQueryData(key, () => setQueryData.data)
          }
        }
      }

      // Call original onSuccess handler if provided
      onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
