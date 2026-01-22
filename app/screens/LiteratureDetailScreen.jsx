import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import CommonHeader from "../components/CommonHeader"
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_BASE_URL = "https://api.scholargens.com/api";

const LiteratureDetailScreen = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme()
    const { bookId, bookTitle, author } = route.params || {}

    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState([]);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                const response = await axios.get(`${API_BASE_URL}/literature-texts/sections?literatureTextId=${bookId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = response.data || [];
                // Handle response structure. Assuming array or { sections: [] }
                // Also check if backend returns 'literatureTextId' based filter correctly.
                const sectionsList = Array.isArray(data) ? data : (data.sections || []);

                // Keep minimal mapping if needed
                const mapped = sectionsList.map(s => ({
                    id: s.id || s._id,
                    title: s.title,
                    content: s.content, // Map content
                    type: s.type || 'chapter'
                }));

                setSections(mapped);

            } catch (error) {
                console.log("Error fetching sections:", error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Could not load book sections.'
                });
            } finally {
                setLoading(false);
            }
        };

        if (bookId) {
            fetchSections();
        } else {
            console.log("No bookId passed to detail screen");
            setLoading(false);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Book details missing'
            });
        }
    }, [bookId]);


    const handleSectionPress = (section) => {
        navigation.navigate("LiteratureContent", {
            sectionId: section.id,
            sectionTitle: section.title,
            bookTitle: bookTitle,
            content: section.content // Pass content
        });
    }

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            {/* Header */}
            <CommonHeader
                title={bookTitle}
                subtitle={author}
                showBack={true}
                rightComponent={<Ionicons name="book-outline" size={24} color={theme.primary} />}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionHeader, { color: theme.text }]}>Table of Contents</Text>

                <View style={[styles.sectionCardB, { backgroundColor: theme.card }]}>


                    {sections.map((section, index) => (
                        <TouchableOpacity
                            key={section.id || index}
                            style={[
                                styles.sectionCard,
                                {
                                    backgroundColor: theme.card,
                                    borderBottomColor: theme.border,
                                    borderBottomWidth: index === sections.length - 1 ? 0 : 1 // Remove border for last item
                                }
                            ]}
                            onPress={() => handleSectionPress(section)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconBox, { backgroundColor: theme.mode === 'dark' ? '#333' : '#F3F4F6' }]}>
                                <Ionicons
                                    name={section.type === 'chapter' ? "bookmarks-outline" : section.type === 'summary' ? "list-outline" : "person-outline"}
                                    size={16}
                                    color={theme.primary}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    // Header styles removed

    content: { padding: 20, borderRadius: 12, },
    sectionHeader: { fontSize: 20, fontFamily: 'DMSans-Bold', marginBottom: 20 },
    sectionCardB: { padding: 5, borderRadius: 12 },
    sectionCard: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        paddingHorizontal: 15,
        gap: 16
    },
    iconBox: {
        width: 40, height: 40, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center'
    },
    sectionTitle: { fontSize: 16, fontFamily: 'DMSans-Medium' },
})

export default LiteratureDetailScreen
