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
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from '../components/CommonHeader';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_BASE_URL = "https://api.scholargens.com/api";

const VideoListScreen = ({ route, navigation }) => {
    const { topicId, topicTitle } = route.params;
    const { theme, isDarkMode } = useTheme();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.get(`${API_BASE_URL}/video-tutorials?topicId=${topicId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setVideos(response.data || []);
        } catch (error) {
            console.log("Error fetching videos:", error);
            Toast.show({
                type: 'error',
                text1: 'Connection Error',
                text2: 'Could not load videos.'
            });
        } finally {
            setLoading(false);
        }
    };

    const extractYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const renderVideoItem = ({ item }) => {
        const videoId = extractYouTubeId(item.youtubeUrl);
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

        return (
            <TouchableOpacity
                style={[styles.videoCard, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate('VideoPlayer', { video: item })}
                activeOpacity={0.8}
            >
                <View style={styles.thumbnailContainer}>
                    {thumbnailUrl ? (
                        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
                    ) : (
                        <View style={[styles.thumbnail, { backgroundColor: theme.background }]}>
                            <Ionicons name="videocam" size={32} color={theme.textSecondary} />
                        </View>
                    )}
                    <View style={styles.playOverlay}>
                        <View style={styles.playButton}>
                            <Ionicons name="play" size={20} color="#fff" />
                        </View>
                    </View>
                    {item.duration && (
                        <View style={styles.durationBadge}>
                            <Text style={styles.durationText}>
                                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.videoInfo}>
                    <Text style={[styles.videoTitle, { color: theme.text }]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    {item.description && (
                        <Text style={styles.videoDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
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

            <CommonHeader title={topicTitle} subtitle={`${videos.length} video${videos.length !== 1 ? 's' : ''}`} showBack={true} />

            <FlatList
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                numColumns={2}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="videocam-off-outline" size={48} color={theme.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No videos available.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    listContent: { padding: 16 },
    row: { justifyContent: 'space-between', marginBottom: 16 },

    videoCard: {
        width: '48%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    thumbnailContainer: {
        position: 'relative',
        aspectRatio: 16 / 9,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'DMSans-Medium',
    },
    videoInfo: {
        padding: 12,
    },
    videoTitle: {
        fontSize: 14,
        fontFamily: 'DMSans-Bold',
        marginBottom: 4,
    },
    videoDescription: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'DMSans-Regular',
    },

    emptyContainer: { alignItems: 'center', marginTop: 50, gap: 10, width: '100%' },
    emptyText: { fontFamily: 'DMSans-Medium', fontSize: 16 }
});

export default VideoListScreen;
