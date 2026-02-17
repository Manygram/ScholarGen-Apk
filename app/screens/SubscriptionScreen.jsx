import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from '../components/CommonHeader';
import Toast from 'react-native-toast-message';
import { subscriptionService } from '../services/subscriptionService';

const SubscriptionScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [activePlan, setActivePlan] = useState('free'); // 'free' or 'premium'

  const handleUpgrade = () => {
    navigation.navigate('Activation');
  };

  const FeatureItem = ({ text }) => (
    <View style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
      <Text style={[styles.featureText, { color: theme.text }]}>{text}</Text>
    </View>
  );

  const handleApplePayment = async () => {
    try {
      const response = await subscriptionService.simulateApplePayment();
      console.log("Apple Payment Response:", response);
      if (response.data) {
        Toast.show({
          type: 'success',
          text1: 'Payment Successful',
          text2: `Plan activated for ${response.data.name || 'User'}`
        });
        // You might want to navigate or update state here based on the response
        // e.g., setActivePlan('premium'); or navigation.goBack();
      }
    } catch (error) {
      console.error("Apple Payment Error:", error);
      Toast.show({
        type: 'error',
        text1: 'Payment Failed',
        text2: error.message || 'An error occurred'
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      <CommonHeader title="Subscription" showBack={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Plan Card */}
        <View style={[styles.currentPlanCard, { backgroundColor: theme.primary }]}>
          <View>
            <Text style={styles.planLabel}>CURRENT PLAN</Text>
            <Text style={styles.planName}>Free Account</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>Active</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Upgrade to Premium</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Unlock full access to all features</Text>

        <View style={[styles.featuresCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <FeatureItem text="Unlimited Practice Tests" />
          <FeatureItem text="Access 1000+ Video Lessons" />
          <FeatureItem text="Download Literature Texts" />
          <FeatureItem text="Study Materials & PDFs" />
          <FeatureItem text="No Ads" />
          <FeatureItem text="Performance Analytics" />
        </View>

        <View style={[styles.priceCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.price, { color: theme.text }]}>₦3,000</Text>
          <Text style={[styles.period, { color: theme.textSecondary }]}>/ 3 months</Text>
        </View>

        {/* Apple Payment Button */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.appleBtn, { backgroundColor: '#000', marginBottom: 15 }]}
            onPress={handleApplePayment}
          >
            <Ionicons name="logo-apple" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.appleBtnText}>Pay with Apple</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.upgradeBtn, { backgroundColor: theme.primary }]}
          onPress={handleUpgrade}
        >
          <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header styles removed

  content: { flex: 1, padding: 20 },

  currentPlanCard: {
    borderRadius: 20, padding: 24, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 30,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
  },
  planLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', marginBottom: 4, fontFamily: 'DMSans-Medium' },
  planName: { color: '#fff', fontSize: 24, fontFamily: 'DMSans-Bold' },
  planBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  planBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  sectionTitle: { fontSize: 20, fontFamily: 'DMSans-Bold', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, fontFamily: 'DMSans-Regular', marginBottom: 20 },

  featuresCard: {
    padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 20, gap: 16
  },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { fontSize: 16, fontFamily: 'DMSans-Medium' },

  priceCard: {
    padding: 20, borderRadius: 16, borderWidth: 1,
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 20
  },
  price: { fontSize: 32, fontFamily: 'DMSans-Bold' },
  period: { fontSize: 16, fontFamily: 'DMSans-Regular', marginLeft: 4 },

  footer: { padding: 20, borderTopWidth: 1 },
  upgradeBtn: {
    borderRadius: 12, height: 50,
    justifyContent: 'center', alignItems: 'center',
  },
  upgradeBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans-Bold' },
  appleBtn: {
    flexDirection: 'row',
    borderRadius: 12, height: 50,
    justifyContent: 'center', alignItems: 'center',
  },
  appleBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans-Bold' },
});

export default SubscriptionScreen;
