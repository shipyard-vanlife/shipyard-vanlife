import React from 'react'
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

interface TermsModalProps {
  visible: boolean
  onClose: () => void
  onAccept?: () => void
}

export const TermsModal: React.FC<TermsModalProps> = ({ visible, onClose, onAccept }) => {
  const { t } = useTranslation('common')

  const handleAccept = () => {
    if (onAccept) {
      onAccept()
    }
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('terms.title')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#2C2C2C" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>1. {t('terms.section1Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section1Content')}
          </Text>

          <Text style={styles.sectionTitle}>2. {t('terms.section2Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section2Content')}
          </Text>

          <Text style={styles.sectionTitle}>3. {t('terms.section3Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section3Content')}
          </Text>

          <Text style={styles.sectionTitle}>4. {t('terms.section4Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section4Content')}
          </Text>

          <Text style={styles.sectionTitle}>5. {t('terms.section5Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section5Content')}
          </Text>

          <Text style={styles.sectionTitle}>6. {t('terms.section6Title')}</Text>
          <Text style={styles.paragraph}>
            {t('terms.section6Content')}
          </Text>

          <Text style={styles.lastUpdate}>
            {t('terms.lastUpdate')}
          </Text>
        </ScrollView>

        {onAccept && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.acceptButtonText}>{t('terms.acceptButton')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4A4A4A',
    marginBottom: 16,
  },
  lastUpdate: {
    fontSize: 13,
    color: '#999',
    marginTop: 32,
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  acceptButton: {
    backgroundColor: '#E07A5F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
