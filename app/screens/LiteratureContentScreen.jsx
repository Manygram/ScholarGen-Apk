import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import CommonHeader from "../components/CommonHeader"
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LiteratureContentScreen = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme()
    const { sectionId, sectionTitle, bookTitle, content: sectionContent } = route.params || {} // Get content

    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');

    useEffect(() => {
        if (sectionContent) {
            setContent(sectionContent);
            setLoading(false);
        } else {
            // Fallback if no content passed (shouldn't happen with updated logic)
             setContent("Content not available.");
             setLoading(false);
        }
    }, [sectionId, sectionContent]);

    if (loading) {
        return (
             <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            {/* Header */}
            <CommonHeader 
                title={sectionTitle} 
                subtitle={bookTitle} 
                showBack={true}
                rightComponent={<Ionicons name="text-outline" size={24} color={theme.primary} />}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.bodyText, { color: theme.text }]}>
                    {content}
                </Text>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Header styles removed
    
    content: { padding: 20, paddingBottom: 60 },
    bodyText: { fontSize: 18, fontFamily: 'DMSans-Regular', lineHeight: 28, textAlign: 'left' },
})

export default LiteratureContentScreen
