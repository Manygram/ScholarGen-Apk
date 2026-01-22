import React, { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native'; // IMPORT THIS
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    PanResponder,
    Animated,
    ActivityIndicator,
    Alert,
    StatusBar,
    TouchableOpacity,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CommonHeader from '../components/CommonHeader';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_BASE_URL = "https://api.scholargens.com/api";

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.4; // Compact Aspect Ratio

const FlashCardScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();

    // --- STATE ---
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // --- REFS ---
    const indexRef = useRef(0);
    const flashcardsRef = useRef([]);
    const isFlippedRef = useRef(false);

    // --- ANIMATION VALUES ---
    const flipAnim = useRef(new Animated.Value(0)).current;
    const position = useRef(new Animated.ValueXY()).current;
    const scale = useRef(new Animated.Value(0.9)).current; // For next card effect

    // --- DATA FETCHING (FIXED) ---
    // Replaced useEffect with useFocusEffect to refresh token every time screen is viewed
    useFocusEffect(
        useCallback(() => {
            fetchFlashcards();

            // Optional cleanup
            return () => { };
        }, [])
    );

    // Sync ref with state (Keep this as useEffect since it relies on state change)
    React.useEffect(() => {
        indexRef.current = currentIndex;
    }, [currentIndex]);

    const fetchFlashcards = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("userToken");

            // Debug Log to verify token presence
            console.log("Flashcards Token Status:", token ? "Found" : "Missing");

            if (!token) {
                console.log("No token found. User might need to login/subscribe.");
                // You might want to stop here or let the API return 401
                // For now, we continue so axios catches the 401 and shows the Toast
            }

            const response = await axios.get(`${API_BASE_URL}/flashcards/app`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data || [];
            // Ensure we extract the array correctly
            const cards = Array.isArray(data) ? data : (data.flashcards || data.data || []);

            if (cards.length === 0) {
                Toast.show({
                    type: 'info',
                    text1: 'Empty Deck',
                    text2: 'No flashcards available yet.'
                });
            }

            setFlashcards(cards);
            flashcardsRef.current = cards;
        } catch (error) {
            console.log("Error fetching flashcards:", error);

            // Specific handling for Unauthorized access (invalid/missing token)
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                Toast.show({
                    type: 'error',
                    text1: 'Access Restricted',
                    text2: 'Please subscribe or log in to view flashcards.'
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Connection Error',
                    text2: 'Could not load flashcards.'
                });
            }
            setFlashcards([]);
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ---
    const flipCard = () => {
        const isFlipped = isFlippedRef.current;

        Animated.spring(flipAnim, {
            toValue: isFlipped ? 0 : 180,
            friction: 8, tension: 10, useNativeDriver: true
        }).start();

        isFlippedRef.current = !isFlipped;
    };

    const nextCard = (direction = 'right') => {
        if (indexRef.current >= flashcardsRef.current.length) return;

        Animated.timing(position, {
            toValue: { x: direction === 'right' ? width + 100 : -width - 100, y: 0 },
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            position.setValue({ x: 0, y: 0 });
            flipAnim.setValue(0);
            isFlippedRef.current = false;
            setCurrentIndex(prev => prev + 1);
            scale.setValue(0.9);
            Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
        });
    };

    const resetDeck = () => {
        setCurrentIndex(0);
        indexRef.current = 0;
        isFlippedRef.current = false;
        flipAnim.setValue(0);
        fetchFlashcards(); // Re-shuffle or reload
    };

    // --- GESTURES ---
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                position.setValue({ x: gestureState.dx, y: gestureState.dy });
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > 120) {
                    nextCard('right');
                } else if (gestureState.dx < -120) {
                    nextCard('left');
                } else {
                    Animated.spring(position, {
                        toValue: { x: 0, y: 0 },
                        friction: 5,
                        useNativeDriver: true
                    }).start();
                }
            }
        })
    ).current;

    // --- INTERPOLATIONS ---
    const rotate = position.x.interpolate({ inputRange: [-width / 2, 0, width / 2], outputRange: ['-10deg', '0deg', '10deg'], extrapolate: 'clamp' });
    const frontRotateY = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
    const backRotateY = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });
    const frontOpacity = flipAnim.interpolate({ inputRange: [89, 90], outputRange: [1, 0] });
    const backOpacity = flipAnim.interpolate({ inputRange: [89, 90], outputRange: [0, 1] });


    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <CommonHeader title="Flashcards" showBack={true} />
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Preparing your deck...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isFinished = currentIndex >= flashcards.length;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <CommonHeader title="Flashcards" showBack={true} />

            {isFinished ? (
                <View style={styles.centerBox}>
                    <Ionicons name="trophy" size={80} color="#F59E0B" />
                    <Text style={[styles.finishedTitle, { color: theme.text }]}>All Done!</Text>
                    <Text style={[styles.finishedSub, { color: theme.textSecondary }]}>You've reviewed all cards.</Text>
                    <TouchableOpacity style={[styles.resetBtn, { backgroundColor: theme.primary }]} onPress={resetDeck}>
                        <Text style={styles.resetBtnText}>Study Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.gameArea}>
                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                            <View style={[styles.progressFill, { width: `${((currentIndex) / flashcards.length) * 100}%`, backgroundColor: theme.primary }]} />
                        </View>
                        <Text style={[styles.progressText, { color: theme.textSecondary }]}>{currentIndex + 1} / {flashcards.length}</Text>
                    </View>

                    {/* Card Stack */}
                    <View style={styles.cardContainer}>
                        {/* Background Card (Design Only) */}
                        {currentIndex < flashcards.length - 1 && (
                            <Animated.View style={[styles.card, styles.bgCard, { backgroundColor: theme.card, transform: [{ scale: 0.95 }, { translateY: 10 }] }]}>
                            </Animated.View>
                        )}

                        {/* Active Card */}
                        <Animated.View
                            {...panResponder.panHandlers}
                            style={[
                                styles.card,
                                {
                                    backgroundColor: 'transparent',
                                    zIndex: 10,
                                    transform: [
                                        { translateX: position.x },
                                        { translateY: position.y },
                                        { rotate: rotate }
                                    ]
                                }
                            ]}
                        >
                            <TouchableOpacity activeOpacity={1} onPress={flipCard} style={{ flex: 1 }}>
                                {/* Front */}
                                <Animated.View style={[styles.cardFace, { transform: [{ rotateY: frontRotateY }], opacity: frontOpacity }]}>
                                    <LinearGradient
                                        colors={isDarkMode ? ['#1E3A8A', '#3B82F6'] : ['#DBEAFE', '#BFDBFE']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.gradientCard}
                                    >
                                        <View style={styles.cardContent}>
                                            <View style={[styles.labelBadge, { backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB' }]}>
                                                <Text style={styles.labelText}>QUESTION</Text>
                                            </View>
                                            <Text style={[styles.cardText, { color: isDarkMode ? '#fff' : '#1E3A8A' }]}>{flashcards[currentIndex].question}</Text>
                                            <View style={styles.flipHint}>
                                                <Ionicons name="refresh-circle" size={28} color={isDarkMode ? '#93C5FD' : '#3B82F6'} />
                                                <Text style={[styles.flipHintText, { color: isDarkMode ? '#93C5FD' : '#3B82F6' }]}>Tap to flip</Text>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </Animated.View>

                                {/* Back */}
                                <Animated.View style={[styles.cardFace, styles.cardBackAbs, { transform: [{ rotateY: backRotateY }], opacity: backOpacity }]}>
                                    <LinearGradient
                                        colors={isDarkMode ? ['#065F46', '#10B981'] : ['#D1FAE5', '#A7F3D0']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.gradientCard}
                                    >
                                        <View style={styles.cardContent}>
                                            <View style={[styles.labelBadge, { backgroundColor: isDarkMode ? '#10B981' : '#059669' }]}>
                                                <Text style={styles.labelText}>ANSWER</Text>
                                            </View>
                                            <Text style={[styles.cardText, { color: isDarkMode ? '#fff' : '#065F46' }]}>{flashcards[currentIndex].answer}</Text>
                                            <View style={styles.flipHint}>
                                                <Ionicons name="checkmark-circle" size={28} color={isDarkMode ? '#6EE7B7' : '#10B981'} />
                                                <Text style={[styles.flipHintText, { color: isDarkMode ? '#6EE7B7' : '#10B981' }]}>Swipe to continue</Text>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </Animated.View>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    {/* Controls */}
                    <View style={styles.controls}>
                        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#FFEEED' }]} onPress={() => nextCard('left')}>
                            <Ionicons name="close" size={24} color="#EF4444" />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={flipCard}>
                            <Text style={styles.actionBtnText}>Flip Card</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#E0F2FE' }]} onPress={() => nextCard('right')}>
                            <Ionicons name="checkmark" size={24} color="#0EA5E9" />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.hint, { color: theme.textSecondary }]}>Tap to flip • Swipe to skip</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    loadingText: { fontSize: 16, fontFamily: 'DMSans-Medium' },
    finishedTitle: { fontSize: 28, fontFamily: 'DMSans-Bold' },
    finishedSub: { fontSize: 16, fontFamily: 'DMSans-Regular', marginBottom: 20 },
    resetBtn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 30 },
    resetBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans-Bold' },

    gameArea: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },

    progressContainer: { width: '80%', flexDirection: 'row', alignItems: 'center', gap: 12 },
    progressBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },
    progressText: { fontSize: 12, fontFamily: 'DMSans-Bold' },

    cardContainer: { width: CARD_WIDTH, height: CARD_HEIGHT, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    card: { width: '100%', height: '100%', borderRadius: 24, position: 'absolute' },
    bgCard: { opacity: 0.5 },

    cardFace: {
        width: '100%', height: '100%',
        borderRadius: 24,
        backfaceVisibility: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    cardBackAbs: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

    gradientCard: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        padding: 3,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    labelBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        position: 'absolute',
        top: 24,
    },
    labelText: {
        fontSize: 11,
        letterSpacing: 1.5,
        color: '#fff',
        fontFamily: 'DMSans-Bold',
    },
    cardText: {
        fontSize: 22,
        textAlign: 'center',
        lineHeight: 32,
        fontFamily: 'DMSans-Bold',
        paddingHorizontal: 16,
    },
    flipHint: {
        position: 'absolute',
        bottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    flipHintText: {
        fontSize: 13,
        fontFamily: 'DMSans-Medium',
    },

    controls: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 20 },
    controlBtn: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    actionBtn: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16 },
    actionBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans-Bold' },

    hint: { fontSize: 12, fontFamily: 'DMSans-Medium', marginTop: 10, opacity: 0.6 }
});

export default FlashCardScreen;