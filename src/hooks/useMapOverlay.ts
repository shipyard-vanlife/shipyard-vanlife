import { useCallback, useEffect, useReducer } from 'react'
import type { NearbyProfile } from '../types/location'
import type { TripOverlayData, TripOverlayStage } from '../types/map'
import { tripToOverlayData, publicTripToOverlayData } from '../types/map'
import type { Trip, PublicTrip, PublicTripStage } from '../types/trip'

interface MapOverlayState {
  tripOverlay: TripOverlayData | null
  selectedStage: TripOverlayStage | null
  selectedProfile: NearbyProfile | null
  sourceProfile: NearbyProfile | null
}

type MapOverlayAction =
  | { type: 'SHOW_TRIP'; tripOverlay: TripOverlayData; sourceProfile?: NearbyProfile | null }
  | {
      type: 'SHOW_TRIP_WITH_STAGE'
      tripOverlay: TripOverlayData
      stage: TripOverlayStage
      sourceProfile?: NearbyProfile | null
    }
  | { type: 'SELECT_STAGE'; stage: TripOverlayStage }
  | { type: 'CLOSE_STAGE' }
  | { type: 'CLOSE_TRIP' }
  | { type: 'BACK_TO_PROFILE' }
  | { type: 'SELECT_PROFILE'; profile: NearbyProfile }
  | { type: 'CLOSE_PROFILE' }

const initialState: MapOverlayState = {
  tripOverlay: null,
  selectedStage: null,
  selectedProfile: null,
  sourceProfile: null,
}

function reducer(state: MapOverlayState, action: MapOverlayAction): MapOverlayState {
  switch (action.type) {
    case 'SHOW_TRIP':
      return {
        tripOverlay: action.tripOverlay,
        selectedStage: null,
        selectedProfile: null,
        sourceProfile: action.sourceProfile ?? null,
      }
    case 'SHOW_TRIP_WITH_STAGE':
      return {
        tripOverlay: action.tripOverlay,
        selectedStage: action.stage,
        selectedProfile: null,
        sourceProfile: action.sourceProfile ?? null,
      }
    case 'SELECT_STAGE':
      return { ...state, selectedStage: action.stage }
    case 'CLOSE_STAGE':
      return { ...state, selectedStage: null }
    case 'CLOSE_TRIP':
      return { ...state, tripOverlay: null, selectedStage: null, sourceProfile: null }
    case 'BACK_TO_PROFILE':
      if (!state.sourceProfile) return state
      return {
        tripOverlay: null,
        selectedStage: null,
        selectedProfile: state.sourceProfile,
        sourceProfile: null,
      }
    case 'SELECT_PROFILE':
      return { ...state, selectedProfile: action.profile }
    case 'CLOSE_PROFILE':
      return { ...state, selectedProfile: null }
    default:
      return state
  }
}

export function useMapOverlay(tripToShow?: Trip | null, onClearTripToShow?: () => void) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Handle trip to show from navigation
  useEffect(() => {
    if (tripToShow) {
      dispatch({ type: 'SHOW_TRIP', tripOverlay: tripToOverlayData(tripToShow) })
      onClearTripToShow?.()
    }
  }, [tripToShow, onClearTripToShow])

  const showTripOverlay = useCallback((tripOverlay: TripOverlayData) => {
    dispatch({ type: 'SHOW_TRIP', tripOverlay })
  }, [])

  const closeTripOverlay = useCallback(() => {
    dispatch({ type: 'CLOSE_TRIP' })
  }, [])

  const backToProfile = useCallback(() => {
    dispatch({ type: 'BACK_TO_PROFILE' })
  }, [])

  const selectStage = useCallback((stage: TripOverlayStage) => {
    dispatch({ type: 'SELECT_STAGE', stage })
  }, [])

  const closeStage = useCallback(() => {
    dispatch({ type: 'CLOSE_STAGE' })
  }, [])

  const selectProfile = useCallback((profile: NearbyProfile) => {
    dispatch({ type: 'SELECT_PROFILE', profile })
  }, [])

  const closeProfile = useCallback(() => {
    dispatch({ type: 'CLOSE_PROFILE' })
  }, [])

  const viewTripOnMap = useCallback(
    (trip: PublicTrip) => {
      dispatch({
        type: 'SHOW_TRIP',
        tripOverlay: publicTripToOverlayData(trip),
        sourceProfile: state.selectedProfile,
      })
    },
    [state.selectedProfile]
  )

  const viewStageOnMap = useCallback(
    (stage: PublicTripStage, trip: PublicTrip) => {
      const overlayData = publicTripToOverlayData(trip)
      const overlayStage = overlayData.stages.find(s => s.id === stage.id)
      if (overlayStage) {
        dispatch({
          type: 'SHOW_TRIP_WITH_STAGE',
          tripOverlay: overlayData,
          stage: overlayStage,
          sourceProfile: state.selectedProfile,
        })
      } else {
        dispatch({
          type: 'SHOW_TRIP',
          tripOverlay: overlayData,
          sourceProfile: state.selectedProfile,
        })
      }
    },
    [state.selectedProfile]
  )

  return {
    ...state,
    showTripOverlay,
    closeTripOverlay,
    backToProfile,
    selectStage,
    closeStage,
    selectProfile,
    closeProfile,
    viewTripOnMap,
    viewStageOnMap,
  }
}
