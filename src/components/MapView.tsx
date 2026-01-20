import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { WebView } from 'react-native-webview'
import { UserProfile } from '../types/user'
import { colors } from '../styles/theme'

interface MapViewProps {
  latitude: number | null
  longitude: number | null
  city: string | null
  myAvatarUrl: string | null
  otherProfiles: UserProfile[]
  onProfileSelect: (profile: UserProfile) => void
}

export const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  myAvatarUrl,
  otherProfiles,
  onProfileSelect,
}) => {
  const { t } = useTranslation('home')


  if (latitude === null || longitude === null) {
    return (
      <View style={[styles.container, styles.noLocation]}>
        <Text style={styles.noLocationText}>{t('map.noLocation')}</Text>
      </View>
    )
  }


  const profilesData = otherProfiles
    .filter(p => p.location?.latitude && p.location?.longitude)
    .map(p => ({
      id: p.id,
      username: p.username,
      lat: p.location!.latitude,
      lng: p.location!.longitude,
      avatarUrl: p.avatar_url,
    }))

  // Debug
  console.log('🗺️ MapView - Total autres profils:', otherProfiles.length)
  console.log('🗺️ MapView - Profils avec coordonnées:', profilesData.length)
  if (profilesData.length > 0) {
    console.log('🗺️ MapView - Exemple profil:', profilesData[0])
  }

  
  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
          }
          #map {
            height: 100%;
            width: 100%;
          }
          .leaflet-container {
            background: ${colors.primary.main};
          }
          .custom-marker {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: ${colors.secondary.main};
            border: 4px solid #fff;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .custom-marker img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .custom-marker::after {
            content: '';
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #fff;
          }
          .custom-marker.has-avatar::after {
            display: none;
          }
          .other-marker {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: ${colors.tertiary.main};
            border: 3px solid #fff;
            box-shadow: 0 3px 6px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            overflow: hidden;
          }
          .other-marker img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .other-marker::after {
            content: '';
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #fff;
          }
          .other-marker.has-avatar::after {
            display: none;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Créer la map centrée sur la position
          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false,
            dragging: true,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: true
          }).setView([${latitude}, ${longitude}], 11);

          // Tile layer avec style personnalisé beige/clair
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            minZoom: 8
          }).addTo(map);

          // Créer un marqueur personnalisé pour ma position
          const myAvatarUrl = ${JSON.stringify(myAvatarUrl)};
          const myMarkerHTML = myAvatarUrl
            ? '<div class="custom-marker has-avatar"><img src="' + myAvatarUrl + '" /></div>'
            : '<div class="custom-marker"></div>';

          const customIcon = L.divIcon({
            html: myMarkerHTML,
            className: '',
            iconSize: [50, 50],
            iconAnchor: [25, 25]
          });

          // Ajouter mon marqueur
          L.marker([${latitude}, ${longitude}], {
            icon: customIcon
          }).addTo(map);

          // Cercle de pulse autour de mon marqueur
          L.circle([${latitude}, ${longitude}], {
            color: '${colors.secondary.main}',
            fillColor: '${colors.secondary.main}',
            fillOpacity: 0.15,
            radius: 3000,
            weight: 0
          }).addTo(map);

          // Données des autres profils
          const otherProfiles = ${JSON.stringify(profilesData)};

          // Ajouter les marqueurs des autres profils
          otherProfiles.forEach(profile => {
            const otherMarkerHTML = profile.avatarUrl
              ? '<div class="other-marker has-avatar"><img src="' + profile.avatarUrl + '" /></div>'
              : '<div class="other-marker"></div>';

            const otherIcon = L.divIcon({
              html: otherMarkerHTML,
              className: '',
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            });

            const marker = L.marker([profile.lat, profile.lng], {
              icon: otherIcon
            }).addTo(map);

            // Gérer le clic sur le marqueur
            marker.on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'profileSelect',
                profileId: profile.id
              }));
            });
          });
        </script>
      </body>
    </html>
  `

  // Gérer les messages de la WebView (clic sur marqueur)
  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data)
      if (message.type === 'profileSelect') {
        const profile = otherProfiles.find(p => p.id === message.profileId)
        if (profile) {
          onProfileSelect(profile)
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error)
    }
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: mapHTML }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        onMessage={handleMessage}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  noLocation: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLocationText: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
})
