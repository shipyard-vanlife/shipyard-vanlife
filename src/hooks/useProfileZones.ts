import { useMemo } from 'react'
import type { NearbyProfile, MapZone, ViewportZone } from '../types/location'

export interface ProfileZonesResult {
  /** Zones with 10+ profiles — render as ZoneBubble */
  zones: MapZone[]
  /** Profiles in sparse areas (<10 in cell) — render as individual markers */
  individualProfiles: NearbyProfile[]
}

/**
 * Transforms DB-aggregated ViewportZone[] into MapZone[] + individual markers.
 * Dense zones (>=10) become bubbles with count + sample avatars.
 * Sparse zones (<10) are unpacked into individual profile markers.
 */
export function useProfileZones(viewportZones: ViewportZone[]): ProfileZonesResult {
  return useMemo(() => {
    if (viewportZones.length === 0) {
      return { zones: [], individualProfiles: [] }
    }

    const zones: MapZone[] = []
    const individualProfiles: NearbyProfile[] = []

    for (const vz of viewportZones) {
      if (vz.profiles === null) {
        // Dense zone — render as bubble (profiles loaded on demand)
        zones.push({
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

    return { zones, individualProfiles }
  }, [viewportZones])
}
