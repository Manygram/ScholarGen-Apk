import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from '../components/CommonHeader';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_BASE_URL = "https://api.scholargens.com/api";

const VideoTopicsScreen = ({ route, navigation }) => {
    const { subjectId, subjectName } = route.params;
    const { theme, isDarkMode } = useTheme();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.get(`${API_BASE_URL}/video-topics?subjectId=${subjectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTopics(response.data || []);
        } catch (error) {
            console.log("Error fetching video topics:", error);
            Toast.show({
                type: 'error',
                text1: 'Connection Error',
                text2: 'Could not load topics.'
            });
        } finally {
            setLoading(false);
        }
    };

    const renderTopicItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={[styles.topicCard, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate('VideoList', { topicId: item.id, topicTitle: item.title })}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Ionicons name="folder-open" size={24} color={theme.primary} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.topicTitle, { color: theme.text }]}>{item.title}</Text>
                    {item.description && (
                        <Text style={styles.topicDescription} numberOfLines={2}>{item.description}</Text>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
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

            <CommonHeader title={subjectName} subtitle="Select a topic to watch videos" showBack={true} />

            <FlatList
                data={topics}
                renderItem={renderTopicItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="folder-open-outline" size={48} color={theme.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No topics available.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    listContent: { padding: 20 },
    topicCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: { flex: 1 },
    topicTitle: { fontSize: 16, fontFamily: 'DMSans-Bold', marginBottom: 4 },
    topicDescription: { fontSize: 13, color: '#666', fontFamily: 'DMSans-Regular' },

    emptyContainer: { alignItems: 'center', marginTop: 50, gap: 10 },
    emptyText: { fontFamily: 'DMSans-Medium', fontSize: 16 }
});

export default VideoTopicsScreen;
