"use client"
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import CommonHeader from "../components/CommonHeader"

const StudyContentScreen = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme()
    const { selectedSubjects, subjectYears } = route.params

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            {/* Header */}
            <CommonHeader title="Study Notes" showBack={true} />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Viewing materials for:</Text>

                {selectedSubjects.map((subject, index) => {
                    // Handle if subject is object (from SubjectSelection) or string (from logic that might pass strings)
                    const name = typeof subject === "object" ? subject.name : subject
                    const id = typeof subject === "object" ? subject._id.toString() : subject
                    const year = subjectYears[id] || "2023"

                    return (
                        <View key={index} style={[styles.subjectCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
                            <View style={styles.subjectHeader}>
                                <Text style={[styles.subjectTitle, { color: theme.primary }]}>{name}</Text>
                                <Text style={[styles.yearBadge, { color: theme.textSecondary, borderColor: theme.border }]}>
                                    {year}
                                </Text>
                            </View>
                            <Text style={[styles.placeholderText, { color: theme.text }]}>
                                Study content for {name} ({year}) will appear here. Topics, summaries, and key points to remember.
                            </Text>
                            <TouchableOpacity style={[styles.readButton, { backgroundColor: theme.primary }]}>
                                <Text style={styles.readButtonText}>Read Chapter 1</Text>
                            </TouchableOpacity>
                        </View>
                    )
                })}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
  // Header styles removed
    content: { padding: 20 },
    subtitle: { fontSize: 16, marginBottom: 20 },
    subjectCard: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    subjectHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    subjectTitle: { fontSize: 18, fontWeight: "bold" },
    yearBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 12 },
    placeholderText: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
    readButton: {
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 8,
    },
    readButtonText: { color: "#fff", fontWeight: "bold" },
})

export default StudyContentScreen
