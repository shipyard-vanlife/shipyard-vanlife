/**
 * Custom Google Maps style - Warm beige/earth tones
 * Matches the app's palette (#F5F1E8 beige, #E07A5F coral)
 * Desaturated, warm, clean - feels like part of the app
 */
export const warmMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f5f0e6' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b5e4f' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#f5f0e6' }, { weight: 2 }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ saturation: -60 }, { lightness: 20 }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d4c5b0' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ede8dc' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [{ color: '#e8e0d2' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#dfd6c5' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#c9d8b6' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text',
    stylers: [{ visibility: 'simplified' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e0d7c8' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#f0e4d0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d4c5a8' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#e5ddd0' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#b8d4e3' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8aabbf' }],
  },
]
