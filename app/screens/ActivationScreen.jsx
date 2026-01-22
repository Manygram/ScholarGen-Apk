import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import CommonHeader from '../components/CommonHeader';
import Toast from 'react-native-toast-message';

const ActivationScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const { deviceId: contextDeviceId, checkPremiumStatus, isPremium } = useAuth();
    const [showSuccess, setShowSuccess] = useState(false);

    // Auto-redirect if premium
    useEffect(() => {
        if (isPremium) {
            Toast.show({
                type: 'success',
                text1: 'Already Active',
                text2: 'You have a premium subscription!'
            });
            navigation.replace('MainTabs');
        }
    }, [isPremium]);

    // User State
    const [userEmail, setUserEmail] = useState('');

    // Payment State
    const [showGateway, setShowGateway] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [transactionRef, setTransactionRef] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Price State
    const [subscriptionPrice, setSubscriptionPrice] = useState(3000);
    const [isPriceLoading, setIsPriceLoading] = useState(true);

    // ---------------------------------------------------------
    // 1. Setup: Get User Email & Price
    // ---------------------------------------------------------
    useEffect(() => {
        const initData = async () => {
            try {
                // Get Email from Session
                const user = await authService.getSession();
                if (user && user.email) {
                    setUserEmail(user.email);
                }

                // Get Price from API
                setIsPriceLoading(true);
                try {
                    const response = await subscriptionService.getSubscriptionPrice();
                    if (response.data && response.data.price) {
                        setSubscriptionPrice(response.data.price);
                    }
                } catch (error) {
                    console.log("Price fetch error (using default):", error.message);
                } finally {
                    setIsPriceLoading(false);
                }
            } catch (error) {
                console.log("Setup Error:", error.message);
            }
        };

        initData();
    }, []);

    // ---------------------------------------------------------
    // 2. Initialize Payment
    // ---------------------------------------------------------
    // ---------------------------------------------------------
    // 2. Initialize Payment
    // ---------------------------------------------------------
    const initializePayment = async () => {
        if (!userEmail) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'User email is missing. Please log out and log in again.'
            });
            return;
        }

        setIsLoading(true);
        try {
            // Use Device ID from Context
            const deviceId = contextDeviceId;
            if (!deviceId) {
                Toast.show({
                    type: 'error',
                    text1: 'Device Error',
                    text2: 'Could not identify device. Please restart app.'
                });
                setIsLoading(false);
                return;
            }

            const payload = {
                plan: 'lifetime',
                deviceId: deviceId
            };

            const response = await apiClient.post('/subscriptions/initialize', payload);

            // Handle Response
            const serverResponse = response.data;
            // Structure: { message, data: { authorization_url, access_code, reference }, reference }
            const paystackData = serverResponse.data;

            if (paystackData && paystackData.authorization_url) {
                setPaymentUrl(paystackData.authorization_url);
                setTransactionRef(paystackData.reference || serverResponse.reference); // Use inner reference or outer
                setShowGateway(true);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Connection Error',
                    text2: 'Could not initialize payment. Please try again.'
                });
            }
        } catch (error) {
            console.log("Payment Init Error:", error);
            Toast.show({
                type: 'error',
                text1: 'Payment Failed',
                text2: error.message || 'An unexpected error occurred.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------------------------------------------------
    // 3. Verify Payment
    // ---------------------------------------------------------
    const verifyPayment = async (reference) => {
        if (!reference) return;

        setIsVerifying(true);
        try {
            const response = await apiClient.get(`/subscriptions/verify/${reference}`);
            const data = response.data;

            if (data.status === 'success' || data.message === 'Payment successful' || data.user?.premium?.active) {

                // Update Local Session with new Premium Status
                if (data.user) {
                    const currentSession = await authService.getSession();
                    const updatedSession = { ...currentSession, ...data.user, user: { ...(currentSession?.user || {}), ...data.user } };
                    await authService.saveSession(updatedSession);

                    // Refresh Context State
                    if (checkPremiumStatus) {
                        await checkPremiumStatus();
                    }
                }

                setShowGateway(false);
                setShowSuccess(true);
            } else {
                Toast.show({
                    type: 'info',
                    text1: 'Processing',
                    text2: 'Payment is still processing. Please wait.'
                });
            }
        } catch (error) {
            console.log("Verify error:", error);
            Toast.show({
                type: 'error',
                text1: 'Verification Failed',
                text2: 'Could not verify payment yet.'
            });
        } finally {
            setIsVerifying(false);
        }
    };

    // ---------------------------------------------------------
    // 4. Inline Modal Component
    // ---------------------------------------------------------
    const PaystackInlineModal = () => {
        return (
            <Modal
                visible={showGateway}
                onRequestClose={() => setShowGateway(false)}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                        <TouchableOpacity onPress={() => setShowGateway(false)}>
                            <Text style={{ color: theme.text, fontSize: 16, fontFamily: 'DMSans-Medium' }}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Secure Payment</Text>
                        <TouchableOpacity onPress={() => verifyPayment(transactionRef)}>
                            <Text style={{ color: '#10B981', fontSize: 16, fontFamily: 'DMSans-Bold' }}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    {paymentUrl ? (
                        <WebView
                            source={{ uri: paymentUrl }}
                            style={{ flex: 1 }}
                            startInLoadingState={true}
                            renderLoading={() => (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={theme.primary} />
                                </View>
                            )}
                            onNavigationStateChange={(state) => {
                                const { url } = state;
                                // Handle Paystack Success/Callback redirects
                                if (url.includes('callback') || url.includes('success') || url.includes('close') || url.includes('verify') || url.includes('localhost')) {

                                    // STOP WebView and CLOSE Modal IMMEDIATELY
                                    setShowGateway(false);

                                    // Try to extract reference from URL if available
                                    const match = url.match(/verify\/([a-zA-Z0-9_-]+)/) || url.match(/reference=([a-zA-Z0-9_-]+)/);
                                    const refFromUrl = match ? match[1] : transactionRef;

                                    // Verify using App's Authenticated Client
                                    verifyPayment(refFromUrl);
                                }
                            }}
                            onShouldStartLoadWithRequest={(request) => {
                                const { url } = request;
                                if (url.includes('callback') || url.includes('success') || url.includes('verify') || url.includes('localhost')) {
                                    setShowGateway(false);
                                    const match = url.match(/verify\/([a-zA-Z0-9_-]+)/) || url.match(/reference=([a-zA-Z0-9_-]+)/);
                                    const refFromUrl = match ? match[1] : transactionRef;
                                    verifyPayment(refFromUrl);
                                    return false; // STOP loading
                                }
                                return true;
                            }}
                            onError={(syntheticEvent) => {
                                const { nativeEvent } = syntheticEvent;
                                // Handle Connection Refused (Localhost) or any error on redirect
                                if ((nativeEvent.url && nativeEvent.url.includes('subscription/verify')) ||
                                    (nativeEvent.description && nativeEvent.description.includes('CONNECTION_REFUSED'))) {

                                    setShowGateway(false);
                                    const url = nativeEvent.url || '';
                                    const match = url.match(/verify\/([a-zA-Z0-9_-]+)/) || url.match(/reference=([a-zA-Z0-9_-]+)/);
                                    const refFromUrl = match ? match[1] : transactionRef;

                                    verifyPayment(refFromUrl);
                                }
                            }}
                        />
                    ) : (
                        <View style={styles.loadingContainer}>
                            <Text style={{ color: theme.text, fontFamily: 'DMSans-Regular' }}>Loading Payment Page...</Text>
                        </View>
                    )}
                </SafeAreaView>
            </Modal>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <CommonHeader title="Premium Access" showBack={true} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero section */}
                <View style={styles.heroCard}>
                    <View style={styles.heroIconContainer}>
                        <Ionicons name="ribbon" size={40} color="#fff" />
                    </View>
                    <Text style={styles.heroTitle}>Unlock Unlimited Access</Text>
                    <Text style={styles.heroSubtitle}>Get complete access to all features and study materials.</Text>
                </View>

                {/* Price section */}
                <View style={[styles.priceContainer, { backgroundColor: theme.card }]}>
                    <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>LIFETIME PLAN</Text>
                    {isPriceLoading ? (
                        <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />
                    ) : (
                        <View style={styles.priceWrapper}>
                            <Text style={[styles.currency, { color: theme.primary }]}>₦</Text>
                            <Text style={[styles.amount, { color: theme.text }]}>
                                {subscriptionPrice.toLocaleString()}
                            </Text>
                        </View>
                    )}
                    <View style={styles.secureBadge}>
                        <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                        <Text style={[styles.secureText, { color: theme.textSecondary }]}> Secure payment via Paystack</Text>
                    </View>
                </View>

                {/* Features section */}
                <View style={styles.featuresContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>What's Included</Text>
                    {[
                        "Access to 1994 - 2026 Past Questions",
                        "Detailed Explanations & Solutions",
                        "Unlimited CBT Practice Mode",
                        "Performance Analytics & Tracking",
                        "Ad-Free Study Experience"
                    ].map((feature, index) => (
                        <View key={index} style={[styles.featureRow, { backgroundColor: theme.card }]}>
                            <View style={[styles.checkIcon, { backgroundColor: theme.primary }]}>
                                <Ionicons name="checkmark" size={16} color="#fff" />
                            </View>
                            <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
                        </View>
                    ))}
                </View>

                {/* Main Action Button */}
                <TouchableOpacity
                    style={[styles.mainButton, { backgroundColor: theme.primary, opacity: isLoading || isPriceLoading ? 0.7 : 1 }]}
                    onPress={initializePayment}
                    disabled={isLoading || isPriceLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.mainButtonText}>
                            Activate Now {isPriceLoading ? '' : `- ₦${subscriptionPrice.toLocaleString()}`}
                        </Text>
                    )}
                </TouchableOpacity>

            </ScrollView>

            <PaystackInlineModal />

            {/* Success Modal */}
            <Modal transparent={true} visible={showSuccess} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.successCard, { backgroundColor: theme.card }]}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark" size={40} color="#fff" />
                        </View>
                        <Text style={[styles.successTitle, { color: theme.text }]}>Payment Successful!</Text>
                        <Text style={[styles.successMessage, { color: theme.textSecondary }]}>
                            You are now a premium member. Enjoy your learning journey!
                        </Text>
                        <TouchableOpacity
                            style={[styles.continueButton, { backgroundColor: theme.primary }]}
                            onPress={() => { setShowSuccess(false); navigation.navigate('MainTabs'); }}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.continueButtonText}>Start Learning</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* Verification Loading Overlay */}
            {isVerifying && (
                <Modal transparent={true} visible={true} animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.successCard, { backgroundColor: theme.card, padding: 40 }]}>
                            <ActivityIndicator size="large" color={theme.primary} />
                            <Text style={[styles.successTitle, { color: theme.text, marginTop: 20, fontSize: 18 }]}>Verifying Payment...</Text>
                            <Text style={[styles.successMessage, { color: theme.textSecondary, marginBottom: 0 }]}>Please wait a moment</Text>
                        </View>
                    </View>
                </Modal>
            )}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    // Header styles removed
    content: { padding: 20, paddingBottom: 40 },
    heroCard: {
        backgroundColor: '#6366F1', // Primary brand color
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        marginBottom: 24,
    },
    heroIconContainer: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    heroTitle: { fontSize: 22, color: '#fff', textAlign: 'center', marginBottom: 8, fontFamily: 'DMSans-Bold' },
    heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 20, fontFamily: 'DMSans-Regular' },
    priceContainer: {
        borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24,
    },
    priceLabel: { fontSize: 12, letterSpacing: 1, marginBottom: 8, fontFamily: 'DMSans-Bold' },
    priceWrapper: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    currency: { fontSize: 24, marginTop: 6, marginRight: 4, fontFamily: 'DMSans-Bold' },
    amount: { fontSize: 48, fontFamily: 'DMSans-Bold' },
    secureBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    secureText: { fontSize: 12, fontWeight: '500', fontFamily: 'DMSans-Medium', marginLeft: 4 },
    featuresContainer: { marginBottom: 30 },
    sectionTitle: { fontSize: 16, marginBottom: 16, marginLeft: 4, fontFamily: 'DMSans-Bold' },
    featureRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
    checkIcon: {
        width: 24, height: 24, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginRight: 16,
    },
    featureText: { fontSize: 14, fontWeight: '500', flex: 1, fontFamily: 'DMSans-Medium' },
    mainButton: {
        height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    mainButtonText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans-Bold' },

    // Modal & Loading
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, borderBottomWidth: 1,
    },
    modalTitle: { fontSize: 18, fontFamily: 'DMSans-Bold' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    successCard: { width: '100%', borderRadius: 24, padding: 32, alignItems: 'center' },
    successIcon: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B981',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    successTitle: { fontSize: 24, marginBottom: 12, textAlign: 'center', fontFamily: 'DMSans-Bold' },
    successMessage: { fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 24, fontFamily: 'DMSans-Regular' },
    continueButton: { width: '100%', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    continueButtonText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans-Bold' },
});

export default ActivationScreen;