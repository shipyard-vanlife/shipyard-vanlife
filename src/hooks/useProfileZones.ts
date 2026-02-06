import { useMemo } from 'react'
import type { NearbyProfile, MapZone, ViewportZone } from '../types/location'

export interface ProfileZonesResult {
  /** Zones with 2+ profiles — render as ZoneBubble */
  zones: MapZone[]
  /** Profiles in sparse areas (1 in cell) — render as individual markers */
  individualProfiles: NearbyProfile[]
}

/**
 * Merge nearby zones into larger bubbles based on current zoom level.
 * Uses a grid-based bucket approach (O(n)) with weighted centroids.
 *
 * At close zoom (latDelta ≤ 0.1): no merging — backend 0.01° cells are fine
 * At medium zoom (0.1–1.0): zones within ~5% of viewport merge
 * At far zoom (>1.0): aggressive merging so bubbles don't overlap
 */
function mergeNearbyZones(zones: MapZone[], latDelta: number): MapZone[] {
  // At close zoom, backend cells are small enough — skip merging
  const mergeGrid = latDelta * 0.05
  if (mergeGrid <= 0.01 || zones.length <= 1) return zones

  const buckets = new Map<string, MapZone>()

  for (const zone of zones) {
    const bLat = Math.round(zone.center.latitude / mergeGrid)
    const bLng = Math.round(zone.center.longitude / mergeGrid)
    const key = `${bLat},${bLng}`

    const existing = buckets.get(key)
    if (existing) {
      // Weighted centroid merge
      const total = existing.count + zone.count
      const lat =
        (existing.center.latitude * existing.count + zone.center.latitude * zone.count) / total
      const lng =
        (existing.center.longitude * existing.count + zone.center.longitude * zone.count) / total

      // Track the maximum extent from centroid to any constituent zone
      const existingRadius = existing.queryRadius ?? 0.01
      const distLat = Math.abs(zone.center.latitude - lat)
      const distLng = Math.abs(zone.center.longitude - lng)
      const newRadius = Math.max(existingRadius, distLat + 0.005, distLng + 0.005)

      buckets.set(key, {
        center: { latitude: lat, longitude: lng },
        count: total,
        sampleAvatars: [...existing.sampleAvatars, ...zone.sampleAvatars].slice(0, 3),
        queryRadius: newRadius,
      })
    } else {
      buckets.set(key, {
        center: { ...zone.center },
        count: zone.count,
        sampleAvatars: [...zone.sampleAvatars],
        queryRadius: 0.01,
      })
    }
  }

  return Array.from(buckets.values())
}

/**
 * Transforms DB-aggregated ViewportZone[] into MapZone[] + individual markers.
 * Dense zones (>=2) become bubbles with count + sample avatars.
 * Sparse zones (1 profile) are unpacked into individual profile markers.
 * Grid cells are ~0.01° (~1.1km). Zone positions use centroids for natural placement.
 *
 * When zoomed out (large latDelta), nearby zones are merged to prevent overlapping.
 */
export function useProfileZones(
  viewportZones: ViewportZone[],
  latDelta: number
): ProfileZonesResult {
  return useMemo(() => {
    if (viewportZones.length === 0) {
      return { zones: [], individualProfiles: [] }
    }

    const rawZones: MapZone[] = []
    const individualProfiles: NearbyProfile[] = []

    for (const vz of viewportZones) {
      if (vz.profiles === null) {
        // Dense zone — render as bubble (profiles loaded on demand)
        rawZones.push({
          center: { latitude: vz.zone_lat, longitude: vz.zone_lng },
          count: vz.profile_count,
          sampleAvatars: vz.sample_avatars ?? [],
        })
      } else {
        // Sparse zone — extract individual profiles for markers
        for (const p of vz.profiles) {
          individualProfiles.push(p)
        }
      }
    }

    // Merge nearby zones when zoomed out to prevent overlapping bubbles
    const zones = mergeNearbyZones(rawZones, latDelta)

    return { zones, individualProfiles }
  }, [viewportZones, latDelta])
}
