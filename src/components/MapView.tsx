import React from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'

interface MapViewProps {
  latitude: number
  longitude: number
  city: string
}

export const MapView: React.FC<MapViewProps> = ({ latitude, longitude, city }) => {
  // HTML pour une map interactive Leaflet avec les couleurs du design
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
            background: #F5F1E8;
          }
          .custom-marker {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #E07A5F;
            border: 4px solid #fff;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .custom-marker::after {
            content: '';
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #fff;
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

          // Créer un marqueur personnalisé
          const customIcon = L.divIcon({
            className: 'custom-marker',
            iconSize: [50, 50],
            iconAnchor: [25, 25]
          });

          // Ajouter le marqueur
          L.marker([${latitude}, ${longitude}], {
            icon: customIcon
          }).addTo(map);

          // Cercle de pulse autour du marqueur
          L.circle([${latitude}, ${longitude}], {
            color: '#E07A5F',
            fillColor: '#E07A5F',
            fillOpacity: 0.15,
            radius: 3000,
            weight: 0
          }).addTo(map);
        </script>
      </body>
    </html>
  `

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: mapHTML }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  webview: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
})
