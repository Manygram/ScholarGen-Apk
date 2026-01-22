import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from '../components/CommonHeader';
import MathRender from '../components/MathRender';

const QuizCorrectionScreen = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme();
    const { correctionsData, finalScore } = route.params;

    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < correctionsData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (!correctionsData || correctionsData.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <CommonHeader title="Corrections" onBack={() => navigation.goBack()} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: theme.text }}>No correction data available.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const currentItem = correctionsData[currentIndex];

    // Helper to determine correctness (Strict Key Match)
    const checkIsCorrect = (option) => {
        // 1. Check Primary Flag
        if (option.isCorrect === true) return true;

        // 2. Strict Key Match
        if (currentItem.correctOption && currentItem.options) {
            // Find index of this option
            const index = currentItem.options.indexOf(option);
            if (index !== -1) {
                const myKey = String.fromCharCode(97 + index); // 0->a, 1->b
                const correctKey = String(currentItem.correctOption || '').trim().toLowerCase();
                if (myKey === correctKey) return true;
            }
        }
        return false;
    };

    const getOptionStyle = (option) => {
        const isCorrect = checkIsCorrect(option);
        const isUserSelected = currentItem.userSelected === option.text;

        if (isCorrect) {
            return { borderColor: "#10B981", backgroundColor: "rgba(16, 185, 129, 0.1)" };
        }
        if (isUserSelected && !isCorrect) {
            return { borderColor: "#EF4444", backgroundColor: "rgba(239, 68, 68, 0.1)" };
        }
        return { borderColor: theme.border, backgroundColor: theme.card };
    };

    const getIcon = (option) => {
        const isCorrect = checkIsCorrect(option);
        const isUserSelected = currentItem.userSelected === option.text;

        if (isCorrect) return <Ionicons name="checkmark-circle" size={24} color="#10B981" />;
        if (isUserSelected && !isCorrect) return <Ionicons name="close-circle" size={24} color="#EF4444" />;
        return null;
    };

    const getImageUrl = (img) => {
        if (!img) return null;
        let url = typeof img === 'string' ? img : img.url;

        if (!url) return null;

        // Clean up
        url = url.trim();

        // Handle relative paths (e.g. /uploads/...)
        if (url.startsWith('/')) {
            const rootBase = "https://api.scholargens.com";
            url = `${rootBase}${url}`;
        } else if (!url.startsWith('http')) {
            // Assume relative to root if not starting with http
            if (url.includes('cloudinary') || url.includes('www')) {
                url = `https://${url}`;
            } else {
                const rootBase = "https://api.scholargens.com";
                url = `${rootBase}/${url}`;
            }
        }

        return url;
    }

    const mainImageUrl = getImageUrl(currentItem.questionImage);
    const explanationImageUrl = getImageUrl(currentItem.explanationImage);
    const imagePos = currentItem.imagePosition || 'top';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <CommonHeader
                title={`Correction (${currentIndex + 1}/${correctionsData.length})`}
                onBack={() => navigation.goBack()}
                rightComponent={
                    <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
                        <Ionicons name="home-outline" size={24} color={theme.text} />
                    </TouchableOpacity>
                }
            />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Question Area */}
                <View style={styles.content}>

                    {/* Top Image */}
                    {mainImageUrl && (imagePos === 'top' || imagePos === 'above') && (
                        <Image source={{ uri: mainImageUrl }} style={styles.questionImage} resizeMode="contain" />
                    )}

                    {/* Question Text */}
                    <View style={{ marginBottom: 20 }}>
                        <MathRender
                            content={currentItem.question}
                            textColor={theme.text}
                            fontSize={18}
                        />
                    </View>

                    {/* Bottom Image */}
                    {mainImageUrl && (imagePos === 'below' || imagePos === 'bottom') && (
                        <Image source={{ uri: mainImageUrl }} style={styles.questionImage} resizeMode="contain" />
                    )}

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        {currentItem.options.map((opt, idx) => (
                            <View
                                key={idx}
                                style={[styles.optionCard, getOptionStyle(opt)]}
                            >
                                <View style={[styles.optionLabel, { backgroundColor: theme.background }]}>
                                    <Text style={{ fontWeight: 'bold', color: theme.text }}>{String.fromCharCode(65 + idx)}</Text>
                                </View>

                                <View style={{ flex: 1, paddingHorizontal: 10 }}>
                                    <MathRender
                                        content={opt.text}
                                        textColor={theme.text}
                                        fontSize={16}
                                    />
                                    {getImageUrl(opt.image) && (
                                        <Image source={{ uri: getImageUrl(opt.image) }} style={styles.optionImage} resizeMode="contain" />
                                    )}
                                </View>

                                {getIcon(opt)}
                            </View>
                        ))}
                    </View>

                    {/* Explanation */}
                    <View style={[styles.explanationCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.explanationHeader}>
                            <Ionicons name="bulb" size={20} color={theme.primary} />
                            <Text style={[styles.explanationTitle, { color: theme.text }]}>Explanation</Text>
                        </View>
                        <View style={{ padding: 8 }}>
                            <MathRender
                                content={currentItem.explanation || "No explanation provided."}
                                textColor={theme.textSecondary}
                                fontSize={14}
                            />
                        </View>
                        {explanationImageUrl && (
                            <Image source={{ uri: explanationImageUrl }} style={styles.explanationImage} resizeMode="contain" />
                        )}
                    </View>

                </View>
            </ScrollView>

            {/* Footer Navigation */}
            <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                <TouchableOpacity
                    onPress={handlePrev}
                    disabled={currentIndex === 0}
                    style={{ opacity: currentIndex === 0 ? 0.5 : 1, flexDirection: 'row', alignItems: 'center' }}
                >
                    <Ionicons name="arrow-back" size={20} color={theme.text} />
                    <Text style={{ color: theme.text, marginLeft: 5, fontFamily: 'DMSans-Bold' }}>Prev</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleNext}
                    disabled={currentIndex === correctionsData.length - 1}
                    style={{ opacity: currentIndex === correctionsData.length - 1 ? 0.5 : 1, flexDirection: 'row', alignItems: 'center' }}
                >
                    <Text style={{ color: theme.primary, marginRight: 5, fontFamily: 'DMSans-Bold' }}>Next</Text>
                    <Ionicons name="arrow-forward" size={20} color={theme.primary} />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    questionImage: { width: '100%', height: 200, marginBottom: 20, borderRadius: 8 },
    optionsContainer: { marginTop: 10 },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderWidth: 1.5,
        borderRadius: 12,
        marginBottom: 12,
    },
    optionLabel: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd'
    },
    optionImage: { width: '100%', height: 100, marginTop: 5, borderRadius: 4 },
    explanationCard: {
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
    },
    explanationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    explanationTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    explanationImage: { width: '100%', height: 150, marginTop: 10, borderRadius: 8 },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderTopWidth: 1,
        paddingBottom: 25,
    }
});

export default QuizCorrectionScreen;
