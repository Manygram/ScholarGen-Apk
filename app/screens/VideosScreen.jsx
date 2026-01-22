import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    StatusBar,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from '../components/CommonHeader';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_BASE_URL = "https://api.scholargens.com/api";

const VideosScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.get(`${API_BASE_URL}/video-subjects`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data || [];
            setSubjects(data);
            setFilteredSubjects(data);
        } catch (error) {
            console.log("Error fetching video subjects:", error);
            Toast.show({
                type: 'error',
                text1: 'Connection Error',
                text2: 'Could not load video subjects.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text) {
            const filtered = subjects.filter(sub =>
                sub.name && sub.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredSubjects(filtered);
        } else {
            setFilteredSubjects(subjects);
        }
    };

    const renderSubjectItem = ({ item }) => {
        const bgColors = ['#EEF2FF', '#F0F9FF', '#FDF2F8', '#FFF7ED', '#F3F4F6'];
        const iconColors = ['#6366F1', '#0EA5E9', '#EC4899', '#F97316', '#6B7280'];
        const colorIndex = (item.name ? item.name.length : 0) % bgColors.length;

        return (
            <TouchableOpacity
                style={[styles.subjectCard, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate('VideoTopics', { subjectId: item.id, subjectName: item.name })}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: bgColors[colorIndex] }]}>
                    <Ionicons name="play-circle" size={24} color={iconColors[colorIndex]} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.subjectName, { color: theme.text }]}>{item.name}</Text>
                    {item.description && <Text style={styles.subjectMeta} numberOfLines={1}>{item.description}</Text>}
                </View>
                <View style={[styles.arrowContainer, { backgroundColor: theme.background }]}>
                    <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                </View>
            </TouchableOpacity>
        );
    };

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
            <CommonHeader title="Video Library" subtitle="Watch and learn from expert tutors." />

            {/* Search Bar */}
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
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Content */}
            <FlatList
                data={filteredSubjects}
                renderItem={renderSubjectItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="videocam-off-outline" size={48} color={theme.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No subjects found.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    searchContainer: { paddingHorizontal: 20, paddingVertical: 10 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchInput: { flex: 1, fontFamily: 'DMSans-Regular', fontSize: 16 },

    listContent: { padding: 20 },
    subjectCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    iconContainer: {
        width: 40, height: 40, borderRadius: 25,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 16,
    },
    textContainer: { flex: 1 },
    subjectName: { fontSize: 16, fontFamily: 'DMSans-Bold', marginBottom: 2 },
    subjectMeta: { fontSize: 13, color: '#666', fontFamily: 'DMSans-Regular' },

    arrowContainer: {
        width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
    },
    emptyContainer: { alignItems: 'center', marginTop: 50, gap: 10 },
    emptyText: { fontFamily: 'DMSans-Medium', fontSize: 16 }
});

export default VideosScreen;