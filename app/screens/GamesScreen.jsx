import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, ScrollView, Modal, Image, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from '../components/CommonHeader';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native'; // Ensure ActivityIndicator is imported

const API_BASE_URL = "https://api.scholargens.com/api";

// Game Data
const MILLIONAIRE_QUESTIONS = [
    {
        question: "Which country contributes the most to the United Nations budget?",
        options: ["China", "Russia", "United States", "United Kingdom"],
        answer: "United States",
        prize: "₦50,000"
    },
    {
        question: "What is the chemical symbol for Gold?",
        options: ["Au", "Ag", "Fe", "Hg"],
        answer: "Au",
        prize: "₦250,000"
    },
    {
        question: "Who was the first female Prime Minister of the United Kingdom?",
        options: ["Theresa May", "Margaret Thatcher", "Liz Truss", "Angela Merkel"],
        answer: "Margaret Thatcher",
        prize: "₦1,000,000"
    }
];

const COUNTRY_QUESTIONS = [
    {
        type: 'fact',
        content: "This country is known as the 'Giant of Africa'.",
        options: ["Ghana", "Nigeria", "South Africa", "Kenya"],
        answer: "Nigeria"
    },
    {
        type: 'fact',
        content: "Home to the Eiffel Tower.",
        options: ["Italy", "Spain", "Germany", "France"],
        answer: "France"
    },
    {
        type: 'fact',
        content: "The largest country in the world by land area.",
        options: ["Canada", "China", "USA", "Russia"],
        answer: "Russia"
    }
];

const GamesScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [activeGame, setActiveGame] = useState(null); // 'MILLIONAIRE' or 'COUNTRY'
    const [gameIndex, setGameIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);

    const [millionaireQuestions, setMillionaireQuestions] = useState([]);
    const [countryQuestions, setCountryQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Win tracking
    const [millionaireWins, setMillionaireWins] = useState(0);
    const [countryWins, setCountryWins] = useState(0);

    const QUESTIONS_PER_ROUND = 10;

    // Load win counts on mount
    useEffect(() => {
        loadWinCounts();
    }, []);

    const loadWinCounts = async () => {
        try {
            const millWins = await AsyncStorage.getItem('millionaireWins');
            const countWins = await AsyncStorage.getItem('countryWins');
            if (millWins) setMillionaireWins(parseInt(millWins));
            if (countWins) setCountryWins(parseInt(countWins));
        } catch (error) {
            console.log('Error loading win counts:', error);
        }
    };

    const saveWinCount = async (gameType, newCount) => {
        try {
            const key = gameType === 'MILLIONAIRE' ? 'millionaireWins' : 'countryWins';
            await AsyncStorage.setItem(key, newCount.toString());
        } catch (error) {
            console.log('Error saving win count:', error);
        }
    };

    // Shuffle array helper
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const resetGame = () => {
        setActiveGame(null);
        setGameIndex(0);
        setScore(0);
        setGameOver(false);
        setGameWon(false);
    };

    // Fetch data when game starts
    const startGame = async (gameType) => {
        console.log(`Starting ${gameType} game...`);
        setLoading(true);
        setActiveGame(gameType);
        setGameIndex(0);
        setScore(0);
        setGameOver(false);
        setGameWon(false);

        try {
            const token = await AsyncStorage.getItem("userToken");
            const endpoint = gameType === 'MILLIONAIRE' ? '/games/millionaire' : '/games/country-guess';

            console.log(`Fetching from: ${API_BASE_URL}${endpoint}`);

            const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log(`${gameType} response:`, response.data);

            const data = response.data || [];
            // Backend likely returns array directly or { questions: [] }
            const questions = Array.isArray(data) ? data : (data.questions || data.data || []);

            console.log(`${gameType} questions loaded:`, questions.length);

            // Parse options if they're stringified (same issue as QuizScreen)
            const parsedQuestions = questions.map(q => {
                let opts = q.options;
                if (typeof opts === 'string') {
                    try { opts = JSON.parse(opts); } catch (e) { opts = []; }
                }
                if (!Array.isArray(opts)) opts = [];

                return {
                    ...q,
                    options: opts
                };
            });

            if (gameType === 'MILLIONAIRE') {
                // Shuffle and take only 10 questions
                const shuffled = shuffleArray(parsedQuestions);
                const limited = shuffled.slice(0, QUESTIONS_PER_ROUND);
                setMillionaireQuestions(limited);
            } else {
                // Shuffle and take only 10 questions
                const shuffled = shuffleArray(parsedQuestions);
                const limited = shuffled.slice(0, QUESTIONS_PER_ROUND);
                setCountryQuestions(limited);
            }

            if (parsedQuestions.length === 0) {
                Toast.show({
                    type: 'info',
                    text1: 'No Questions',
                    text2: `No ${gameType === 'MILLIONAIRE' ? 'Millionaire' : 'Country'} questions available.`
                });
                setActiveGame(null); // Go back to menu
            }

        } catch (error) {
            console.error(`Error fetching ${gameType} questions:`, error);
            console.error('Error details:', error.response?.data || error.message);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not load game data.'
            });
            setActiveGame(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (selectedOption) => {
        let questions = activeGame === 'MILLIONAIRE' ? millionaireQuestions : countryQuestions;
        const currentQ = questions[gameIndex];

        // Ensure we handle case where questions might not be loaded yet
        if (!currentQ) return;

        // Debug logging
        console.log('Current Question:', currentQ);
        console.log('Selected Option:', selectedOption);

        // For country game, the correct answer is in 'name' field
        // For millionaire, it's in 'answer' or 'correctOption'
        const correctAnswer = activeGame === 'COUNTRY'
            ? currentQ.name
            : (currentQ.answer || currentQ.correctOption || currentQ.correctAnswer);

        console.log('Correct Answer:', correctAnswer);
        console.log('Match:', selectedOption === correctAnswer);

        if (selectedOption === correctAnswer) {
            setScore(prev => prev + 1);
            if (gameIndex < questions.length - 1) {
                setGameIndex(prev => prev + 1);
            } else {
                // Player won the round!
                setGameWon(true);

                // Increment and save win count
                if (activeGame === 'MILLIONAIRE') {
                    const newWins = millionaireWins + 1;
                    setMillionaireWins(newWins);
                    saveWinCount('MILLIONAIRE', newWins);
                } else {
                    const newWins = countryWins + 1;
                    setCountryWins(newWins);
                    saveWinCount('COUNTRY', newWins);
                }
            }
        } else {
            setGameOver(true);
        }
    };

    const renderMillionaireGame = () => {
        const q = millionaireQuestions[gameIndex];
        if (!q) return <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1 }} />;

        return (
            <SafeAreaView style={[styles.gameContainer, { backgroundColor: '#110F19' }]}>
                <StatusBar barStyle="light-content" backgroundColor="#110F19" />

                {/* Header */}
                <View style={styles.gameHeader}>
                    <TouchableOpacity onPress={resetGame} style={styles.quitButton}>
                        <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
                    </TouchableOpacity>
                    <View style={styles.milLogoContainer}>
                        <Ionicons name="trophy" size={20} color="#FFD700" />
                        <Text style={styles.milLogoText}>MILLIONAIRE</Text>
                    </View>
                    <View style={styles.milPrizeBadge}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.milPrizeValue}>{millionaireWins}</Text>
                    </View>
                </View>

                {/* Progress */}
                <View style={styles.milProgressContainer}>
                    {millionaireQuestions.map((_, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.milProgressDot,
                                idx <= gameIndex && { backgroundColor: '#FFD700', opacity: 1 },
                                idx === gameIndex && { transform: [{ scale: 1.2 }] }
                            ]}
                        />
                    ))}
                </View>

                {/* Question */}
                <View style={styles.milQuestionCard}>
                    <Text style={styles.milQuestionText}>{q.question}</Text>
                </View>

                {/* Options */}
                <View style={styles.milOptionsGrid}>
                    {q.options.map((opt, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.milOptionButton}
                            onPress={() => handleAnswer(opt)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.milOptionHexagon}>
                                <Text style={styles.milOptionLabel}>{String.fromCharCode(65 + idx)}</Text>
                            </View>
                            <Text style={styles.milOptionText}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </SafeAreaView>
        );
    };

    const renderCountryGame = () => {
        const q = countryQuestions[gameIndex];
        if (!q) return <ActivityIndicator size="large" color={theme.primary} style={{ flex: 1 }} />;

        return (
            <SafeAreaView style={[styles.gameContainer, { backgroundColor: '#E0F7FA' }]}>
                <StatusBar barStyle="dark-content" backgroundColor="#E0F7FA" />

                {/* Header */}
                <View style={styles.gameHeader}>
                    <TouchableOpacity onPress={resetGame} style={[styles.quitButton, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                        <Ionicons name="close" size={24} color="#006064" />
                    </TouchableOpacity>
                    <View style={styles.countryScoreBadge}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.countryScoreText}>{countryWins}</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.countryMain}>
                    <Text style={styles.countryClueLabel}>GUESS THE COUNTRY FLAG</Text>

                    {/* Flag Image */}
                    {q.imageUrl ? (
                        <Image
                            source={{ uri: q.imageUrl }}
                            style={styles.flagImage}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.flagPlaceholder}>
                            <Ionicons name="flag" size={80} color="#00ACC1" />
                        </View>
                    )}
                </View>

                {/* Options */}
                <View style={styles.countryOptions}>
                    {q.options && q.options.map((opt, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.countryOptionButton}
                            onPress={() => handleAnswer(typeof opt === 'string' ? opt : opt.text)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.countryOptionText}>{typeof opt === 'string' ? opt : opt.text}</Text>
                            <Ionicons name="arrow-forward-circle" size={24} color="rgba(255,255,255,0.8)" />
                        </TouchableOpacity>
                    ))}
                </View>
            </SafeAreaView>
        );
    };

    // Main Menu
    if (!activeGame) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />

                <CommonHeader title="Game Center" showBack={true} />

                <ScrollView contentContainerStyle={styles.content}>
                    <TouchableOpacity
                        style={[styles.gameCard, { backgroundColor: '#211848' }]}
                        onPress={() => startGame('MILLIONAIRE')}
                        activeOpacity={0.9}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="trophy" size={32} color="#FFD700" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.gameTitle}>Millionaire</Text>
                                <Text style={styles.gameSubtitle}>Test your knowledge & win big!</Text>
                            </View>
                            <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.5)" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.gameCard, { backgroundColor: '#00ACC1' }]}
                        onPress={() => startGame('COUNTRY')}
                        activeOpacity={0.9}
                    >
                        <View style={styles.cardContent}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Ionicons name="earth" size={32} color="#fff" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.gameTitle}>Guess Country</Text>
                                <Text style={styles.gameSubtitle}>Explore the world via facts</Text>
                            </View>
                            <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.5)" />
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Result Modal
    return (
        <>
            {activeGame === 'MILLIONAIRE' ? renderMillionaireGame() : renderCountryGame()}
            <Modal transparent={true} visible={gameOver || gameWon} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
                        <View style={[styles.resultIcon, { backgroundColor: gameWon ? '#10B981' : '#EF4444' }]}>
                            <Ionicons name={gameWon ? "trophy" : "close"} size={40} color="#fff" />
                        </View>
                        <Text style={[styles.resultTitle, { color: theme.text }]}>
                            {gameWon ? "Victory!" : "Game Over"}
                        </Text>
                        <Text style={[styles.resultText, { color: theme.textSecondary }]}>
                            {gameWon ? `Score: ${score}/${activeGame === 'MILLIONAIRE' ? millionaireQuestions.length : countryQuestions.length}` : "Try again!"}
                        </Text>
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.border, borderWidth: 1 }]} onPress={resetGame}>
                                <Text style={[styles.actionBtnText, { color: theme.text }]}>Quit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={() => startGame(activeGame)}>
                                <Text style={[styles.actionBtnText, { color: '#fff' }]}>Play Again</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    // Header styles removed for main menu, keeping backButton for internal use if needed? 
    // Wait, backButton is used in gameHeader too? No, gameHeader has quitButton. 
    // Checking usage... backButton is only used in Main Menu. Safe to remove? 
    // Let's check lines 283.
    // backButton: { padding: 8, marginLeft: -8 },
    // headerTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'DMSans-Bold' },
    content: { padding: 20 },

    // Cards
    gameCard: {
        borderRadius: 20,
        marginBottom: 16,
        justifyContent: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center', marginRight: 16,
    },
    textContainer: { flex: 1 },
    gameTitle: { fontSize: 20, color: '#fff', fontFamily: 'DMSans-Bold', marginBottom: 4 },
    gameSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: 'DMSans-Regular' },

    // In-Game Common
    gameContainer: { flex: 1 },
    gameHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
    },
    quitButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center',
    },

    // Millionaire
    milLogoContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    milLogoText: { color: '#FFD700', letterSpacing: 1, fontFamily: 'DMSans-Bold' },
    milPrizeBadge: { backgroundColor: 'rgba(255,215,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    milPrizeValue: { color: '#FFD700', fontFamily: 'DMSans-Bold' },
    milProgressContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 40 },
    milProgressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', opacity: 0.2 },
    milQuestionCard: { marginHorizontal: 20, padding: 30, backgroundColor: '#1E1E2C', borderRadius: 24, borderWidth: 1, borderColor: '#FFD700', marginBottom: 30 },
    milQuestionText: { color: '#fff', fontSize: 18, textAlign: 'center', lineHeight: 28, fontFamily: 'DMSans-Bold' },
    milOptionsGrid: { gap: 12, paddingHorizontal: 20 },
    milOptionButton: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#2A2A40', padding: 8, borderRadius: 30, borderWidth: 1, borderColor: '#4A4A6A'
    },
    milOptionHexagon: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#110F19',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFD700', marginRight: 16
    },
    milOptionLabel: { color: '#FFD700', fontFamily: 'DMSans-Bold' },
    milOptionText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans-Medium', flex: 1 },

    // Country Game
    countryScoreBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    countryScoreText: { color: '#333', fontFamily: 'DMSans-Bold' },
    countryMain: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    countryIconContainer: { marginBottom: 20, width: 120, height: 120, borderRadius: 60, backgroundColor: '#B2EBF2', justifyContent: 'center', alignItems: 'center' },
    countryClueLabel: { color: '#00ACC1', letterSpacing: 1, marginBottom: 10, fontFamily: 'DMSans-Bold' },
    flagImage: {
        width: 280,
        height: 180,
        borderRadius: 12,
        marginVertical: 20,
        borderWidth: 3,
        borderColor: '#00ACC1',
        backgroundColor: '#fff'
    },
    flagPlaceholder: {
        width: 280,
        height: 180,
        borderRadius: 12,
        marginVertical: 20,
        backgroundColor: 'rgba(0,172,193,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#00ACC1',
        borderStyle: 'dashed'
    },
    countryClue: { color: '#37474F', fontSize: 24, textAlign: 'center', lineHeight: 32, fontFamily: 'DMSans-Bold' },
    countryOptions: { padding: 20, gap: 12 },
    countryOptionButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#00ACC1', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
    },
    countryOptionText: { color: '#fff', fontSize: 18, fontFamily: 'DMSans-Bold' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    resultCard: { width: '100%', borderRadius: 24, padding: 30, alignItems: 'center' },
    resultIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    resultTitle: { fontSize: 24, marginBottom: 8, fontFamily: 'DMSans-Bold' },
    resultText: { fontSize: 16, marginBottom: 24, fontFamily: 'DMSans-Regular' },
    actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
    actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    actionBtnText: { fontSize: 16, fontFamily: 'DMSans-Bold' },
});

export default GamesScreen;
