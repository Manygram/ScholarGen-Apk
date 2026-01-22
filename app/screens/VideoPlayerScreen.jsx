import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Dimensions,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from '../components/CommonHeader';

const { width } = Dimensions.get('window');

const VideoPlayerScreen = ({ route }) => {
    const { video } = route.params;
    const { theme, isDarkMode } = useTheme();
    const [playing, setPlaying] = useState(false);

    const onStateChange = useCallback((state) => {
        if (state === "ended") {
            setPlaying(false);
        }
    }, []);

    const extractYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = extractYouTubeId(video.youtubeUrl);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            <CommonHeader title={video.title} showBack={true} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Video Player */}
                {videoId ? (
                    <View style={styles.videoContainer}>
                        <YoutubePlayer
                            height={width * (9 / 16)}
                            width={width}
                            play={playing}
                            videoId={videoId}
                            onChangeState={onStateChange}
                            webViewStyle={{ opacity: 0.99 }} // Fix for potential android crash
                        />
                    </View>
                ) : (
                    <View style={[styles.videoContainer, styles.errorContainer, { backgroundColor: theme.card }]}>
                        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
                            Invalid YouTube URL
                        </Text>
                    </View>
                )}

                {/* Video Info */}
                <View style={styles.infoContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>{video.title}</Text>

                    {video.duration && (
                        <View style={styles.metaRow}>
                            <Text style={styles.metaText}>
                                Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                            </Text>
                        </View>
                    )}

                    {video.description && (
                        <View style={[styles.descriptionContainer, { backgroundColor: theme.card }]}>
                            <Text style={[styles.descriptionTitle, { color: theme.text }]}>Description</Text>
                            <Text style={[styles.description, { color: theme.textSecondary }]}>
                                {video.description}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },
    videoContainer: {
        width: width,
        height: width * (9 / 16), // 16:9 aspect ratio
        backgroundColor: '#000',
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontFamily: 'DMSans-Medium',
        fontSize: 14,
    },
    infoContainer: {
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontFamily: 'DMSans-Bold',
        marginBottom: 12,
    },
    metaRow: {
        marginBottom: 16,
    },
    metaText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'DMSans-Regular',
    },
    descriptionContainer: {
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    descriptionTitle: {
        fontSize: 16,
        fontFamily: 'DMSans-Bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'DMSans-Regular',
    },
});

export default VideoPlayerScreen;
