import { useEffect } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'

/**
 * Hook to manage screen orientation for fullscreen viewers
 * Unlocks orientation when visible, locks back to portrait when hidden
 */
export function useViewerOrientation(visible: boolean): void {
  useEffect(() => {
    if (visible) {
      ScreenOrientation.unlockAsync()
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    }

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    }
  }, [visible])
}
