import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
  Image,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import { authService } from '../services/authService';
import CommonHeader from '../components/CommonHeader';

import { useDatabase } from '../context/DatabaseContext';
import { apiClient } from '../services/apiClient';
import Toast from 'react-native-toast-message';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { syncOfflineData } = useDatabase();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [user, setUser] = useState({ name: 'User', email: 'user@example.com' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // NEW: State for deletion loading

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    Toast.show({
      type: 'info',
      text1: 'Syncing Content',
      text2: 'Downloading questions for offline use...'
    });

    // Pass apiClient to sync function
    const success = await syncOfflineData(apiClient, (progress) => {
      // Optional: Update progress
    });

    setIsSyncing(false);
    if (success) {
      Toast.show({
        type: 'success',
        text1: 'Sync Completed',
        text2: 'Content is now available offline.'
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Sync Failed',
        text2: 'Could not download content. Check connection.'
      });
    }
  };

  useEffect(() => {
    // Load user data on mount
    const loadUser = async () => {
      const userData = await authService.getSession();
      if (userData) {
        setUser({
          name: userData.name || userData.user?.name || 'User',
          email: userData.email || userData.user?.email || 'user@example.com'
        });
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }
        }
      ]
    );
  };

  // ✅ NEW: Handle Account Deletion
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and all your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive', // Shows as red on iOS
          onPress: async () => {
            if (isDeleting) return;

            try {
              setIsDeleting(true);

              // Call the new service method we added
              await authService.deleteAccount();

              Toast.show({
                type: 'success',
                text1: 'Account Deleted',
                text2: 'We are sorry to see you go.'
              });

              // Reset to Welcome Screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });

            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Deletion Failed',
                text2: error.message || 'Please check your connection and try again.'
              });
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, showArrow = true, lastItem = false }) => (
    <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border, borderBottomWidth: lastItem ? 0 : 1 }]} onPress={onPress} activeOpacity={0.7} disabled={!onPress && !rightComponent}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: isDarkMode ? '#333' : '#EFF6FF' }]}>
          <Ionicons name={icon} size={20} color={theme.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={[styles.sectionHeader, { color: theme.text }]}>{title}</Text>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      <CommonHeader title="Settings" subtitle="Manage your account and preferences" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={[styles.profileCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
            <View style={[styles.profileImageContainer, { backgroundColor: isDarkMode ? '#333' : '#E0E7FF' }]}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.primary }}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]} numberOfLines={1}>{user.name}</Text>
              <Text style={[styles.profileEmail, { color: theme.textSecondary }]} numberOfLines={1}>{user.email}</Text>
              <TouchableOpacity style={styles.editProfileButton} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={[styles.editProfileText, { color: theme.primary }]}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <SectionHeader title="Account" />
        <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
          <SettingItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update personal info"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <SettingItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Security settings"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <SettingItem
            icon="card-outline"
            title="Subscription"
            subtitle="Manage plan & payments"
            onPress={() => navigation.navigate('Subscription')}
            lastItem={true}
          />
        </View>

        {/* Preferences Section */}
        <SectionHeader title="Preferences" />
        <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
          <SettingItem
            icon="cloud-download-outline"
            title="Sync Content"
            subtitle="Download questions for offline use"
            onPress={handleSync}
            rightComponent={isSyncing ? <ActivityIndicator size="small" color={theme.primary} /> : null}
            showArrow={!isSyncing}
          />
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Study reminders"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E5EA', true: theme.primary }}
                thumbColor="#fff"
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Toggle theme"
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#E5E5EA', true: theme.primary }}
                thumbColor="#fff"
              />
            }
            showArrow={false}
            lastItem={true}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="Support" />
        <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
          <SettingItem
            icon="help-buoy-outline"
            title="Help & Support"
            subtitle="Get assistance"
            onPress={() => navigation.navigate('HelpSupport')}
          />
          <SettingItem
            icon="information-circle-outline"
            title="About"
            subtitle="App version 1.0.0"
            onPress={() => Alert.alert('ScholarGen', 'Version 1.0.0\nComplete Study Companion.')}
          />
          <SettingItem
            icon="star-outline"
            title="Rate App"
            subtitle="Share your feedback"
            onPress={() => Alert.alert('Rate', 'Thanks for rating!')}
            lastItem={true}
          />
        </View>

        {/* Danger Zone: Logout & Delete */}
        <View style={[styles.settingsSection, { backgroundColor: theme.card, marginTop: 24 }]}>
          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.logoutButton, { borderBottomWidth: 1, borderBottomColor: theme.border }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.text} />
            <Text style={[styles.logoutText, { color: theme.text }]}>Logout</Text>
          </TouchableOpacity>

          {/* Delete Account Button - NEW */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            )}
            <Text style={[styles.logoutText, { color: "#EF4444" }]}>
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Image source={require("../../assets/app-icon-new.png")} style={styles.footerLogo} resizeMode="contain" />
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>ScholarGen UTME</Text>
          <Text style={[styles.versionText, { color: theme.textSecondary }]}>v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },

  profileSection: { padding: 20 },
  profileCard: {
    padding: 20, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  profileImageContainer: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontFamily: 'DMSans-Bold', marginBottom: 2 },
  profileEmail: { fontSize: 14, fontFamily: 'DMSans-Regular', marginBottom: 6 },
  editProfileButton: { alignSelf: 'flex-start' },
  editProfileText: { fontSize: 14, fontWeight: '600', fontFamily: 'DMSans-SemiBold' },

  sectionHeader: {
    fontSize: 14, fontWeight: '600', fontFamily: 'DMSans-Medium',
    marginLeft: 20, marginBottom: 8, marginTop: 16, textTransform: 'uppercase', opacity: 0.7
  },
  settingsSection: { marginHorizontal: 20, borderRadius: 12, overflow: 'hidden' },

  settingItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderColor: '#f0f0f0'
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 16, fontFamily: 'DMSans-Medium', marginBottom: 2 },
  settingSubtitle: { fontSize: 13, fontFamily: 'DMSans-Regular' },
  settingRight: { flexDirection: 'row', alignItems: 'center' },

  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: { fontSize: 16, fontWeight: '600', marginLeft: 8, fontFamily: 'DMSans-SemiBold' },

  footer: { alignItems: 'center', paddingVertical: 40, paddingBottom: 60 },
  footerLogo: { width: 60, height: 60, marginBottom: 12 },
  footerText: { fontSize: 20, fontFamily: 'DMSans-Bold', marginBottom: 4 },
  versionText: { fontSize: 14, fontFamily: 'DMSans-Regular', opacity: 0.6 },
});

export default SettingsScreen;