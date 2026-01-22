import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
  ActivityIndicator,
  Image,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from "../components/CommonHeader";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_BASE_URL = "https://api.scholargens.com/api";

function extractVideoId(url) {
  try {
    const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
    if (shortMatch && shortMatch[1]) return shortMatch[1];
    const watchMatch = url.match(/[?&]v=([^&#]+)/);
    if (watchMatch && watchMatch[1]) return watchMatch[1];
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&#]+)/);
    if (embedMatch && embedMatch[1]) return embedMatch[1];
    return null;
  } catch (e) {
    return null;
  }
}

const SubjectVideosScreen = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const { subjectId, subjectName } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const fetchVideos = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const token = await AsyncStorage.getItem("userToken");
      // Endpoint assumption: GET /subjects/:id/videos or similar. 
      // If API doesn't have it, we might fetch topics and aggregate.
      // Let's assume there is an endpoint or we try to get topics.
      // If not, we might need to rely on the general topics endpoint.

      // Let's try fetching topics for the subject, and assuming topics contain video URLs
      const response = await axios.get(`${API_BASE_URL}/subjects/${subjectId}/topics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Mapping topics to a flat video list for now, or keeping them grouped?
      // User asked for "list topics that has video".
      // Let's flatten for easier search first, or show topics?
      // "click on that subject it will list topics that has video"
      // Let's list Topics.
      const topicsData = response.data || [];

      // Filter topics that actually have videoUrl
      const videosData = topicsData
        .filter(t => t.videoUrl && extractVideoId(t.videoUrl))
        .map(t => ({
          id: t._id,
          title: t.title || 'Untitled Topic',
          description: t.content || t.description || 'No description available.',
          url: t.videoUrl,
          videoId: extractVideoId(t.videoUrl),
          thumbnail: `https://img.youtube.com/vi/${extractVideoId(t.videoUrl)}/mqdefault.jpg`
        }));

      setVideos(videosData);
      setFilteredVideos(videosData);

    } catch (error) {
      console.log("Error fetching videos:", error);
      // Fallback mock data if API fails or is empty for testing UI
      /*
      const mock = [
          { id: '1', title: 'Introduction to Mechanics', description: 'Basic concepts of physics.', videoId: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
          { id: '2', title: 'Algebra Functions', description: 'Understanding f(x).', videoId: '3ROWIXIjT0c', thumbnail: 'https://img.youtube.com/vi/3ROWIXIjT0c/mqdefault.jpg' },
      ];
      setVideos(mock);
      setFilteredVideos(mock);
      */
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not load videos.'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (subjectId) {
      fetchVideos();
    } else {
      setLoading(false);
    }
  }, [subjectId]);

  const onRefresh = () => {
    fetchVideos(true);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text) {
      const filtered = videos.filter(v => v.title.toLowerCase().includes(text.toLowerCase()));
      setFilteredVideos(filtered);
    } else {
      setFilteredVideos(videos);
    }
  };

  const openVideo = (video) => {
    setSelectedVideo(video);
    setModalVisible(true);
  };

  const closeVideo = () => {
    setModalVisible(false);
    setSelectedVideo(null);
  };

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.videoCard, { backgroundColor: theme.card }]}
      onPress={() => openVideo(item)}
      activeOpacity={0.9}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
        <View style={styles.playOverlay}>
          <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.videoTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.videoDesc, { color: theme.textSecondary }]} numberOfLines={2}>{item.description}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={theme.primary} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>Video Lesson</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
      <CommonHeader title={subjectName || 'Videos'} showBack={true} />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search topics..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredVideos}
        renderItem={renderVideoItem}
        keyExtractor={item => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No videos found for this subject yet.</Text>
          </View>
        }
      />

      {/* Video Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeVideo}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: '#000' }]}>
          {/* Close Button Overlay */}
          <TouchableOpacity style={styles.closeButton} onPress={closeVideo}>
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>

          <View style={styles.videoPlayerContainer}>
            {selectedVideo && selectedVideo.videoId && (
              <WebView
                style={styles.webView}
                originWhitelist={['*']}
                source={{
                  uri: `https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&playsinline=1`,
                }}
                allowsFullscreenVideo={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
              />
            )}
          </View>

          {/* Simple Description Area below video if not fullscreen */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>{selectedVideo?.title}</Text>
            <Text style={styles.detailsDesc}>{selectedVideo?.description}</Text>
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Header styles removed

  searchContainer: { padding: 20, paddingBottom: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 12, height: 46
  },
  searchInput: { flex: 1, fontFamily: 'DMSans-Regular', fontSize: 16 },

  listContent: { padding: 20 },

  videoCard: {
    borderRadius: 16, marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
    overflow: 'hidden'
  },
  thumbnailContainer: { height: 180, width: '100%', position: 'relative', backgroundColor: '#000' },
  thumbnail: { width: '100%', height: '100%', opacity: 0.8 },
  playOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center'
  },
  cardContent: { padding: 16 },
  videoTitle: { fontSize: 16, fontFamily: 'DMSans-Bold', marginBottom: 6 },
  videoDesc: { fontSize: 13, fontFamily: 'DMSans-Regular', marginBottom: 10, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, fontFamily: 'DMSans-Medium' },

  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyText: { fontFamily: 'DMSans-Medium', fontSize: 16, textAlign: 'center' },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#000' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 50 },
  videoPlayerContainer: { height: 250, width: '100%', marginTop: 100, backgroundColor: '#000' },
  webView: { flex: 1 },
  detailsContainer: { padding: 20, flex: 1 },
  detailsTitle: { color: '#fff', fontSize: 20, fontFamily: 'DMSans-Bold', marginBottom: 10 },
  detailsDesc: { color: '#ccc', fontSize: 14, fontFamily: 'DMSans-Regular', lineHeight: 22 },
});

export default SubjectVideosScreen;