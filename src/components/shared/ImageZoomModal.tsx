import React from 'react'
import { Dimensions, Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../styles/theme'

interface ImageZoomModalProps {
  imageUrl: string | null
  onClose: () => void
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ imageUrl, onClose }) => {
  return (
    <Modal visible={!!imageUrl} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={30} color={colors.white} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
  },
})
