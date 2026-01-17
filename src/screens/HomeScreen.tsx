import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { BottomSheet } from '../components/BottomSheet';
import { MapView } from '../components/MapView';
import { UserProfile } from '../types/user';

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();

  // Mock data - à remplacer par les vraies données Supabase
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: user?.id || '1',
    username: 'Alex et Dims',
    email: user?.email || '',
    vanName: 'les rebeux',
    city: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    mainSpecialty: 'mechanic',
    skills: ['mechanic', 'electricity', 'carpentry'],
    daysOnRoad: 127,
    connectionsCount: 23,
  });

  return (
    <View style={styles.container}>
      {/* Vraie map interactive avec Leaflet */}
      <MapView
        latitude={userProfile.latitude}
        longitude={userProfile.longitude}
        city={userProfile.city}
      />

      {/* Card overlay avec info ville */}
      <View style={styles.mapOverlay}>
        <Text style={styles.cityLabel}>{userProfile.city}</Text>
        <Text style={styles.regionLabel}>Île-de-France</Text>
      </View>

      <BottomSheet profile={userProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  mapOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  regionLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
