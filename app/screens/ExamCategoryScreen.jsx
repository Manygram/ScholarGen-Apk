import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import CommonHeader from "../components/CommonHeader"
import { EXAM_CATEGORIES } from "../data/subjects"

// Filter for UTME only
const CATEGORIES = EXAM_CATEGORIES.filter((c) => c.id.includes("UTME"))

const ExamCategoryScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme()

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            {/* Header */}
            <CommonHeader title="Select Practice Type" showBack={true} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.introContainer}>
                    <Text style={[styles.introTitle, { color: theme.text }]}>What would you like to practice?</Text>
                    <Text style={styles.introSubtitle}>Choose a category to start your UTME preparation.</Text>
                </View>

                {CATEGORIES.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[styles.card, { backgroundColor: theme.card }]}
                        onPress={() =>
                            navigation.navigate("ExamConfig", { categoryId: category.id, categoryTitle: category.title })
                        }
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardContent}>
                            <View style={[styles.iconContainer, { backgroundColor: '#E0E7FF' }]}>
                                <Ionicons name="school" size={20} color="#4F46E5" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={[styles.cardTitle, { color: theme.text }]}>{category.title}</Text>
                                <Text style={styles.cardDescription}>{category.description}</Text>
                            </View>
                            <View style={[styles.arrowContainer, { backgroundColor: theme.background }]}>
                                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    // Header styles removed
    content: { padding: 20 },
    introContainer: { marginBottom: 30, marginTop: 10 },
    introTitle: { fontSize: 24, marginBottom: 8, fontFamily: 'DMSans-Bold' },
    introSubtitle: { fontSize: 16, color: '#666', lineHeight: 22, fontFamily: 'DMSans-Regular' },

    card: {
        borderRadius: 15,
        marginBottom: 16,
        padding: 15,
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    textContainer: { flex: 1, marginRight: 12 },
    cardTitle: { fontSize: 15, marginBottom: 6, fontFamily: 'DMSans-Bold' },
    cardDescription: { fontSize: 13, color: '#666', lineHeight: 20, fontFamily: 'DMSans-Regular' },
    arrowContainer: {
        width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
    }
})

export default ExamCategoryScreen
