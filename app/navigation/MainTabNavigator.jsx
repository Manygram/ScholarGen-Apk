import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  BackHandler,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService'; // IMPORT THIS

// Import screen components
import HomeScreen from '../screens/HomeScreen.jsx';
import VideosScreen from '../screens/VideosScreen.jsx';
import StudyMaterialsScreen from '../screens/StudyMaterialsScreen.jsx';
import SettingsScreen from '../screens/SettingsScreen.jsx';

const MainTabNavigator = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();

  // 1. Get Context Values
  const { isPremium, checkPremiumStatus } = useAuth();

  // 2. Add Local Backup State
  const [localIsPremium, setLocalIsPremium] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // 3. ROBUST REFRESH: Check both Context AND Local Storage
  useFocusEffect(
    useCallback(() => {
      const verifyStatus = async () => {
        // A. Trigger Context Refresh
        if (checkPremiumStatus) {
          await checkPremiumStatus();
        }

        // B. Direct Storage Check (Source of Truth)
        try {
          const session = await authService.getSession();
          // Check deep inside the object for active status
          const isActive = session?.premium?.active || session?.user?.premium?.active;

          if (isActive) {
            console.log('[MainTabNavigator] Local session confirms Premium');
            setLocalIsPremium(true);
          }
        } catch (err) {
          console.log('Error checking local session', err);
        }
      };

      verifyStatus();
    }, [])
  );

  // Handle Android Back Button
  React.useEffect(() => {
    const backAction = () => {
      if (activeTab !== 0) {
        setActiveTab(0);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [activeTab]);

  const tabs = [
    { name: 'Home', icon: 'home', component: HomeScreen },
    { name: 'Videos', icon: 'play-circle', component: VideosScreen },
    { name: 'Study', icon: 'book', component: StudyMaterialsScreen },
    { name: 'Profile', icon: 'person', component: SettingsScreen },
  ];

  const handleTabPress = (index) => {
    console.log('[MainTabNavigator] Tab pressed:', tabs[index].name);

    // 4. THE FIX: Check Context OR Local State
    // If either one is true, allow access.
    const hasAccess = isPremium || localIsPremium;

    // Premium Blocks (Index 1 = Videos, Index 2 = Study)
    if ((index === 1 || index === 2) && !hasAccess) {
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

    setActiveTab(index);
  };

  const renderContent = () => {
    const Component = tabs[activeTab].component;
    return <Component navigation={navigation} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* Bottom Tab Navigation */}
      <View style={[styles.bottomTabContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View style={styles.tabBar}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tabItem,
                activeTab === index && styles.activeTabItem,
              ]}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconContainer}>
                <Ionicons
                  name={tab.icon}
                  size={18}
                  color={activeTab === index ? theme.primary : theme.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === index && { color: theme.primary, fontWeight: '600' },
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
  },
  bottomTabContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderTopColor: '#E5E5EA',
    paddingBottom: 25,
    paddingTop: 10,
    width: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 0,
    minWidth: 50,
  },
  activeTabItem: {
    // Additional styling for active tab if needed
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  tabLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default MainTabNavigator;