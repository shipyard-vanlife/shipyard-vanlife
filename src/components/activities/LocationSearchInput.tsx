import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius, fontSize } from '../../styles/theme'

interface LocationSearchInputProps {
  onLocationSelect: (location: {
    name: string
    latitude: number
    longitude: number
    address: string
  }) => void
  placeholder?: string
  initialValue?: string
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  name: string
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  onLocationSelect,
  placeholder = 'Rechercher un lieu...',
  initialValue = '',
}) => {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      setShowResults(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        // Nominatim API (OpenStreetMap) - 100% gratuit
        // countrycodes=fr pour prioriser la France
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&countrycodes=fr&limit=5&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'VanlifeApp/1.0',
            },
          }
        )
        const data = await response.json()
        setResults(data)
        setShowResults(true)
      } catch (error) {
        console.error('Location search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSelect = (result: NominatimResult) => {
    const locationName = result.name || result.display_name.split(',')[0]
    setQuery(locationName)
    setShowResults(false)
    onLocationSelect({
      name: locationName,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color={colors.text.tertiary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={query}
          onChangeText={setQuery}
          onFocus={() => {
            if (results.length > 0) setShowResults(true)
          }}
        />
        {loading && <ActivityIndicator size="small" color={colors.secondary.main} />}
      </View>

      {showResults && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <ScrollView
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {results.map((item) => (
              <TouchableOpacity
                key={item.place_id}
                style={styles.resultItem}
                onPress={() => handleSelect(item)}
              >
                <Ionicons name="location" size={18} color={colors.secondary.main} />
                <View style={styles.resultText}>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item.name || item.display_name.split(',')[0]}
                  </Text>
                  <Text style={styles.resultAddress} numberOfLines={1}>
                    {item.display_name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.main,
    height: 48,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  resultsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  resultText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  resultName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
})
