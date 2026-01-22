import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Image, FlatList, Platform, StatusBar, RefreshControl, Modal, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useDatabase } from "../context/DatabaseContext";
import Toast from 'react-native-toast-message';
import { authService } from "../services/authService";
import { apiClient } from "../services/apiClient";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();

  // 1. GET checkPremiumStatus FROM CONTEXT
  const { isPremium, checkPremiumStatus } = useAuth();

  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef(null);

  // Progress Slider Logic
  const progressListRef = useRef(null);
  const [currentProgressIndex, setCurrentProgressIndex] = useState(0);

  // State for User & Stats
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // derived stats
  const progressStats = [
    { id: 1, label: "Tests Taken", value: userStats?.testsTaken || "0", icon: "checkmark-circle", color: "#6366F1" },
    { id: 2, label: "Average Score", value: userStats?.avgScore ? `${userStats.avgScore}%` : "0%", icon: "trending-up", color: "#10B981" },
    { id: 3, label: "Study Progress", value: userStats?.progress?.percentage ? `${userStats.progress.percentage}%` : "0%", icon: "time", color: "#F59E0B" },
    { id: 4, label: "Questions", value: userStats?.questionsAnswered || "0", icon: "help-circle", color: "#EC4899" },
  ];

  const sliderImages = [
    {
      id: 1,
      title: "Master UTME 2026",
      subtitle: "Your path to success starts here",
      image: require("../../assets/hero/hero1.jpg"),
    },
    {
      id: 2,
      title: "Study Smart",
      subtitle: "Access comprehensive study materials",
      image: require("../../assets/hero/hero2.jpg"),
    },
    {
      id: 3,
      title: "Practice Tests",
      subtitle: "Take unlimited practice exams",
      image: require("../../assets/hero/hero3.jpg"),
    },
  ];

  const quickActions = [
    { id: 1, title: "UTME Practice", icon: "document-text", color: "#6366F1" },
    { id: 3, title: "Games", icon: "game-controller", color: "#8B5CF6" },
    { id: 4, title: "Flashcards", icon: "albums", color: "#10B981" },
    { id: 5, title: "Calculator", icon: "calculator", color: "#F59E0B" },
    { id: 7, title: "Literature Texts", icon: "book", color: "#3B82F6" },
    { id: 8, title: "Study Materials", icon: "folder-open", color: "#6B7280" },
  ];

  // Fetch User and Stats
  const fetchDashboardData = async () => {
    try {
      const session = await authService.getSession();
      if (session) {
        const response = await apiClient.get('/stats/user-dashboard');
        if (response.data) {
          setUserStats(response.data);
        }
      }
      setUser(session);
    } catch (error) {
      console.log("Dashboard fetch error:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();

      // 2. FORCE REFRESH GLOBAL PREMIUM STATUS
      if (checkPremiumStatus) {
        checkPremiumStatus();
        console.log("Syncing premium status...");
      }
    }, [])
  );

  // Safe check for database
  const database = useDatabase();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        const nextSlide = (prevSlide + 1) % sliderImages.length;
        flatListRef.current?.scrollToIndex({ index: nextSlide, animated: true });
        return nextSlide;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [sliderImages.length]);

  // Auto Scroll for Progress Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentProgressIndex((prev) => {
        const next = (prev + 1) % progressStats.length;
        progressListRef.current?.scrollToIndex({ index: next, animated: true, viewPosition: 0.5 });
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Refresh Control Logic
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Refresh both dashboard data AND global auth status
    Promise.all([
      fetchDashboardData(),
      checkPremiumStatus ? checkPremiumStatus() : Promise.resolve()
    ]).finally(() => {
      Toast.show({
        type: 'success',
        text1: 'Refreshed',
        text2: 'Dashboard updated'
      });
      setRefreshing(false);
    });
  };

  const handleSlideChange = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const handleQuickAction = (action) => {
    // 3. ROBUST CHECK: Check Context OR Local User Object
    // This ensures if context is stale but local user is fresh, it still works.
    const hasPremiumAccess = isPremium || (user?.premium?.active) || (user?.user?.premium?.active);

    const premiumActions = ["Flashcards", "Literature Texts", "Study Materials"];

    if (premiumActions.includes(action.title) && !hasPremiumAccess) {
      Alert.alert(
        "Premium Feature",
        "Please activate to access this feature.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Activate Now", onPress: () => navigation.navigate("Activation") }
        ]
      );
      return;
    }

    if (action.title === "Calculator") {
      navigation.navigate("Calculator");
    } else if (action.title === "UTME Practice") {
      navigation.navigate("ExamCategory");
    } else if (action.title.includes("Games")) {
      navigation.navigate("Games");
    } else if (action.title === "Flashcards") {
      navigation.navigate("FlashCard");
    } else if (action.title === "Activate" || action.title === "Activate App") {
      navigation.navigate("Activation");
    } else if (action.title === "Literature Texts") {
      navigation.navigate("Literature");
    } else if (action.title === "Study Materials") {
      navigation.navigate("StudyMaterials");
    } else {
      Toast.show({
        type: 'info',
        text1: action.title,
        text2: `${action.title} feature will be available soon!`
      });
    }
  };

  const renderSliderItem = ({ item }) => (
    <View style={styles.slideItem}>
      <Image source={item.image} style={styles.slideImage} resizeMode="cover" />
    </View>
  );

  const renderQuickAction = (action) => (
    <TouchableOpacity key={action.id} style={[styles.quickActionItem, { backgroundColor: theme.card, shadowColor: theme.text }]} onPress={() => handleQuickAction(action)} activeOpacity={0.8}>
      <View style={[styles.quickActionIcon, { backgroundColor: action.color + "15" }]}>
        <Ionicons name={action.icon} size={20} color={action.color} />
      </View>
      <Text style={[styles.quickActionText, { color: theme.text }]}>{action.title}</Text>
    </TouchableOpacity>
  );

  const renderProgressCard = ({ item }) => (
    <View style={[styles.progressCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
      <View style={[styles.progressIconBox, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={15} color={item.color} />
      </View>
      <View style={styles.progressContent}>
        <Text style={[styles.progressValue, { color: item.color }]}>{item.value}</Text>
        <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>{item.label}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Image source={require("../../assets/app-icon-new.png")} style={styles.headerLogo} resizeMode="contain" />
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>ScholarGen</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>UTME Preparation</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Show Activate/Activated Button */}
          {(() => {
            // Check mostly fresh local user data for visual badge
            const isPremiumUser = user?.premium?.active || user?.user?.premium?.active;

            if (isPremiumUser) {
              return (
                <TouchableOpacity
                  style={[styles.activateHeaderBtn, { backgroundColor: '#10B981' }]}
                  onPress={() => setShowSubscriptionModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginRight: 4 }} />
                  <Text style={styles.activateHeaderBtnText}>ACTIVATED</Text>
                </TouchableOpacity>
              );
            } else {
              return (
                <TouchableOpacity
                  style={styles.activateHeaderBtn}
                  onPress={() => navigation.navigate("Activation")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="key" size={12} color="#fff" style={{ marginRight: 4 }} />
                  <Text style={styles.activateHeaderBtnText}>Activate</Text>
                </TouchableOpacity>
              );
            }
          })()}

          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Notification')}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />
        }
      >
        <View style={styles.sliderContainer}>
          <FlatList
            ref={flatListRef}
            data={sliderImages}
            renderItem={renderSliderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleSlideChange}
            keyExtractor={(item) => item.id.toString()}
          />
          <View style={styles.indicatorContainer}>
            {sliderImages.map((_, index) => (
              <View key={index} style={[styles.indicator, { backgroundColor: currentSlide === index ? "#333" : "rgba(0,0,0,0.2)" }]} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>{quickActions.map(renderQuickAction)}</View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>My Progress</Text>
          <View style={styles.progressSliderContainer}>
            <FlatList
              ref={progressListRef}
              data={progressStats}
              renderItem={renderProgressCard}
              horizontal
              pagingEnabled={false}
              snapToInterval={width * 0.45 + 12}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingHorizontal: 10 }}
            />
          </View>
        </View>

        {/* Streaks Card */}
        <View style={styles.section}>
          <View style={[styles.streakCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
            <View style={[styles.streakIconContainer, { backgroundColor: "#FF572220" }]}>
              <Ionicons name="flame" size={32} color="#FF5722" />
            </View>
            <View style={styles.streakContent}>
              <Text style={[styles.streakTitle, { color: theme.text }]}>Current Streak</Text>
              <Text style={[styles.streakValue, { color: "#FF5722" }]}>
                {userStats?.streaks?.current || 0} Days
              </Text>
              <Text style={[styles.streakSubtitle, { color: theme.textSecondary }]}>
                {userStats?.streaks?.current > 0 ? "You're on fire! Keep it up!" : "Start a streak today!"}
              </Text>
            </View>
            <View style={styles.fireBadge}>
              <Ionicons name="bonfire" size={24} color={userStats?.streaks?.current > 0 ? "#FF5722" : "#ccc"} />
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Subscription Modal */}
      <Modal
        visible={showSubscriptionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubscriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.subscriptionModal, { backgroundColor: isDarkMode ? '#1E293B' : '#fff' }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.planIconContainer}>
                <Ionicons name="diamond" size={36} color="#10B981" />
              </View>
              <Text style={[styles.planTitle, { color: isDarkMode ? '#fff' : '#1F2937' }]}>Premium Activated</Text>
              <View style={styles.planBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#fff" />
                <Text style={styles.planBadgeText}>LIFETIME ACCESS</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Features */}
            <Text style={[styles.featuresLabel, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>INCLUDED FEATURES</Text>
            <View style={styles.featuresList}>
              {[
                "Unlimited Practice Tests (CBT)",
                "Full Study Materials & PDFs",
                "Video Tutorials Library",
                "Educational Games & Flashcards",
                "Performance Analytics",
                "Ad-Free Experience",
                "Offline Access"
              ].map((feature, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  <Text style={[styles.featureText, { color: isDarkMode ? '#CBD5E1' : '#475569' }]}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={[styles.closeModalBtn, { backgroundColor: '#10B981' }]}
              onPress={() => setShowSubscriptionModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 16,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerLogo: { width: 40, height: 40, marginRight: 12 },
  headerTitle: { fontSize: 20, fontFamily: 'DMSans-Bold' },
  headerSubtitle: { fontSize: 14, fontFamily: 'DMSans-Regular' },

  activateHeaderBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EC4899', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20
  },
  activateHeaderBtnText: { color: '#fff', fontSize: 12, fontFamily: 'DMSans-Bold' },

  notificationButton: { position: "relative", padding: 8 },
  notificationBadge: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF3B30" },
  scrollView: { flex: 1 },
  sliderContainer: { height: 200, position: "relative", marginBottom: 16 },
  slideItem: { width: width, height: 200, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  slideImage: { width: "100%", height: "100%" },
  indicatorContainer: { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center" },
  indicator: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 3 },
  section: { paddingHorizontal: 20, paddingVertical: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 15, marginBottom: 16, fontFamily: 'DMSans-Bold' },
  seeAllText: { fontSize: 14, color: "#FFC107", fontWeight: "600", fontFamily: 'DMSans-SemiBold' },
  quickActionsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  quickActionItem: {
    width: (width - 64) / 3,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  quickActionText: { fontSize: 13, textAlign: "center", fontWeight: "600", fontFamily: 'DMSans-SemiBold' },
  statsContainer: { flexDirection: "row", justifyContent: "space-between" },
  statCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center", marginHorizontal: 4 },
  statIconContainer: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginBottom: 6 },
  statNumber: { fontSize: 20, marginBottom: 2, fontFamily: 'DMSans-Bold' },
  statLabel: { fontSize: 9, textAlign: "center", fontWeight: "500", fontFamily: 'DMSans-Medium' },

  // Progress Slider Styles
  progressSliderContainer: { marginHorizontal: -10 },
  progressCard: {
    width: width * 0.45,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    marginHorizontal: 6,
    gap: 12,
    borderWidth: 0,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  progressIconBox: {
    width: 30, height: 30,
    borderRadius: 24,
    justifyContent: 'center', alignItems: 'center'
  },
  progressContent: { flex: 1 },
  progressValue: { fontSize: 18, fontFamily: 'DMSans-Bold', marginBottom: 2 },
  progressLabel: { fontSize: 12, fontFamily: 'DMSans-Medium' },

  // Streak Card Styles
  streakCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, marginTop: 0 },
  streakIconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  streakContent: { flex: 1 },
  streakTitle: { fontSize: 14, fontWeight: '600', fontFamily: 'DMSans-SemiBold', marginBottom: 4 },
  streakValue: { fontSize: 24, fontFamily: 'DMSans-Bold', marginBottom: 2 },
  streakSubtitle: { fontSize: 12, fontFamily: 'DMSans-Regular', lineHeight: 18 },
  fireBadge: { opacity: 0.2, transform: [{ rotate: '15deg' }] },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  subscriptionModal: { width: '100%', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10 },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  planIconContainer: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  planTitle: { fontSize: 24, fontFamily: 'DMSans-Bold', marginBottom: 8 },
  planBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, gap: 4 },
  planBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'DMSans-Bold', letterSpacing: 0.5 },
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 20 },
  featuresLabel: { fontSize: 12, fontFamily: 'DMSans-Bold', marginBottom: 12, alignSelf: 'flex-start', letterSpacing: 1 },
  featuresList: { width: '100%', gap: 12, marginBottom: 24 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 14, fontFamily: 'DMSans-Medium' },
  closeModalBtn: { width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  closeModalText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans-Bold' },
});

export default HomeScreen;