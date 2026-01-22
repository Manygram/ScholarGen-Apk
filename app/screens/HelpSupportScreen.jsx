import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from '../components/CommonHeader';

const HelpSupportScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();

  const handleContact = (type, value) => {
    if (type === 'email') Linking.openURL(`mailto:${value}`);
    if (type === 'phone') Linking.openURL(`tel:${value}`);
    if (type === 'whatsapp') Linking.openURL(`https://wa.me/${value}`);
  };

  const ContactItem = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.card }]} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: theme.mode === 'dark' ? '#333' : '#F3F4F6' }]}>
        <Ionicons name={icon} size={24} color={theme.primary} />
      </View>
      <View>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      <CommonHeader title="Help & Support" showBack={true} />

      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Us</Text>
        <ContactItem
          icon="mail-outline" title="Email Support" subtitle="info@scholargens.com"
          onPress={() => handleContact('email', 'info@scholargens.com')}
        />
        <ContactItem
          icon="call-outline" title="Phone Support" subtitle="+234 800 123 4567"
          onPress={() => handleContact('phone', '+2348001234567')}
        />
        <ContactItem
          icon="logo-whatsapp" title="WhatsApp" subtitle="Chat with us"
          onPress={() => handleContact('whatsapp', '2348001234567')}
        />

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Frequently Asked Questions</Text>

        <View style={[styles.faqContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.question, { color: theme.text }]}>How do I reset my password?</Text>
          <Text style={[styles.answer, { color: theme.textSecondary }]}>Go to Settings {'>'} Change Password inside the app.</Text>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.question, { color: theme.text }]}>Can I use the app offline?</Text>
          <Text style={[styles.answer, { color: theme.textSecondary }]}>Yes! Once you download resources or subscribe to the premium plan, many features work offline.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header styles removed

  content: { flex: 1, padding: 20 },

  sectionTitle: { fontSize: 16, fontFamily: 'DMSans-Bold', marginBottom: 12, marginLeft: 4 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 12, marginBottom: 12,
    gap: 16
  },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontFamily: 'DMSans-Bold' },
  cardSubtitle: { fontSize: 14, fontFamily: 'DMSans-Regular' },

  faqContainer: { padding: 20, borderRadius: 12 },
  question: { fontSize: 16, fontWeight: '600', fontFamily: 'DMSans-SemiBold', marginBottom: 8 },
  answer: { fontSize: 14, fontFamily: 'DMSans-Regular', lineHeight: 20, marginBottom: 16 },
  divider: { height: 1, marginVertical: 16 },
});

export default HelpSupportScreen;
