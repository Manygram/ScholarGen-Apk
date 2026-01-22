import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Platform, ActivityIndicator, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import CommonHeader from "../components/CommonHeader"
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = "https://api.scholargens.com/api";

const StudyMaterialDetailScreen = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme()
    const { categoryId, categoryName } = route.params || {}
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                // Calling /study-materials?categoryId=...
                const response = await axios.get(`${API_BASE_URL}/study-materials?categoryId=${categoryId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = response.data || [];
                const materials = Array.isArray(data) ? data : (data.materials || []);

                const mapped = materials.map(m => ({
                    id: m.id || m._id,
                    title: m.title,
                    type: m.type || 'pdf', // 'pdf', 'doc', etc.
                    size: m.size || 'Unknown', // e.g. '2.4 MB'
                    url: m.fileUrl || m.url // ensure backend returns fileUrl
                }));

                setFiles(mapped);
            } catch (error) {
                 console.log("Error fetching study materials:", error);
                 // No Toast imported here? I should add it or just log.
                 // Ideally I should show user feedback.
                 // Assuming I'll add Toast import in next step or user can see empty list.
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) fetchFiles();
    }, [categoryId]);

    const openFile = (file) => {
        navigation.navigate('PDFViewer', { url: file.url, title: file.title });
    }

    const renderFile = ({ item }) => (
        <TouchableOpacity 
            style={[styles.fileCard, { backgroundColor: theme.card }]}
            onPress={() => openFile(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="document-text" size={16} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.fileMeta, { color: theme.textSecondary }]}>{item.type.toUpperCase()} • {item.size}</Text>
            </View>
            <Ionicons name="download-outline" size={20} color={theme.primary} />
        </TouchableOpacity>
    );

    if (loading) return <View style={[styles.loading, {backgroundColor: theme.background}]}><ActivityIndicator color={theme.primary} /></View>;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
            <CommonHeader title={categoryName} showBack={true} />

            <FlatList
                data={files}
                renderItem={renderFile}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 20 }}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Header styles removed
    fileCard: {
        flexDirection: 'row', alignItems: 'center',
        padding: 12, borderRadius: 12, marginBottom: 8,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, 
        gap: 16
    },
    iconBox: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    fileName: { fontSize: 16, fontWeight: '500', fontFamily: 'DMSans-Medium', marginBottom: 4 },
    fileMeta: { fontSize: 12, fontFamily: 'DMSans-Regular' },
})

export default StudyMaterialDetailScreen
