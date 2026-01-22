import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    SafeAreaView, Platform, StatusBar, ActivityIndicator, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from '../components/CommonHeader';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_BASE_URL = "https://api.scholargens.com/api";

const StudyMaterialsScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                const response = await axios.get(`${API_BASE_URL}/study-materials/categories`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = response.data || [];
                // Handle response structure. Assuming array or { categories: [] }
                const categories = Array.isArray(data) ? data : (data.categories || []);

                // Map to UI model if needed, or use as is. 
                // Backend likely returns { id, name, ... }. UI expects { _id, title, count, icon, color }

                // If backend returns simple objects, we might need to map icons/colors randomly or based on name
                const mapped = categories.map((cat, index) => ({
                    _id: cat.id || cat._id,
                    title: cat.name || cat.title,
                    count: cat.materialCount || 0,
                    icon: getIconForSubject(cat.name || cat.title),
                    color: getColorForSubject(index)
                }));

                setMaterials(mapped);
                setFilteredMaterials(mapped);
            } catch (error) {
                console.log("Error loading materials:", error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Could not load study categories.'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    // Helper functions for UI
    const getIconForSubject = (name) => {
        const lower = (name || "").toLowerCase();
        if (lower.includes('math')) return 'calculator-outline';
        if (lower.includes('english')) return 'text-outline';
        if (lower.includes('physic')) return 'flash-outline';
        if (lower.includes('chem')) return 'flask-outline';
        if (lower.includes('bio')) return 'leaf-outline';
        return 'book-outline';
    };

    const getColorForSubject = (index) => {
        const colors = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#6366F1'];
        return colors[index % colors.length];
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text) {
            setFilteredMaterials(materials.filter(m => m.title.toLowerCase().includes(text.toLowerCase())));
        } else {
            setFilteredMaterials(materials);
        }
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('StudyMaterialDetail', { categoryId: item._id, categoryName: item.title })}
            activeOpacity={0.8}
        >
            <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{item.count} Files</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
    );

    if (loading) return <View style={[styles.loading, { backgroundColor: theme.background }]}><ActivityIndicator color={theme.primary} /></View>;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
            <CommonHeader title="Study Materials" showBack={true} />

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="Search subjects..."
                        placeholderTextColor={theme.textSecondary}
                        style={[styles.searchInput, { color: theme.text }]}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </View>

            <FlatList
                data={filteredMaterials}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    // Header styles removed
    searchContainer: { paddingHorizontal: 20, paddingVertical: 12 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderRadius: 12,
        paddingHorizontal: 12, height: 48,
    },
    searchInput: { flex: 1, fontFamily: 'DMSans-Regular', fontSize: 16 },
    card: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, borderRadius: 16, marginBottom: 12,
        gap: 16
    },
    iconBox: { width: 40, height: 40, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    cardTitle: { fontSize: 14, fontFamily: 'DMSans-Bold', marginBottom: 4 },
    cardSubtitle: { fontSize: 13, fontFamily: 'DMSans-Regular' },
});

export default StudyMaterialsScreen;
