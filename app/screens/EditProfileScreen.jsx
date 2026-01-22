import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import { authService } from '../services/authService';
import { apiClient } from '../services/apiClient';
import CommonHeader from '../components/CommonHeader';
import Toast from 'react-native-toast-message';

// Move InputField outside to prevent re-creation on every render
const InputField = ({ label, value, onChange, placeholder, icon, keyboardType = 'default', editable = true, theme }) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    <View style={[styles.inputWrapper, { backgroundColor: editable ? theme.card : theme.background, borderColor: theme.border, opacity: editable ? 1 : 0.7 }]}>
      <Ionicons name={icon} size={20} color={theme.textSecondary} style={{ marginRight: 10 }} />
      <TextInput
        style={[styles.input, { color: editable ? theme.text : theme.textSecondary }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary + '80'}
        keyboardType={keyboardType}
        editable={editable}
      />
    </View>
  </View>
);

const EditProfileScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiClient.get('/users/profile');
        if (response.data) {
          setUserData({
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone || '', // API might not return phone yet
          });
        }
      } catch (error) {
        console.log("Failed to load profile:", error);
        // Fallback to session
        const session = await authService.getSession();
        if (session) {
          setUserData({
            name: session.name || session.user?.name || '',
            email: session.email || session.user?.email || '',
            phone: session.phone || session.user?.phone || '',
          });
        }
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await apiClient.put('/users/profile', {
        name: userData.name,
        phone: userData.phone
      });

      // Update local session to keep app in sync
      const currentSession = await authService.getSession();
      const updatedSession = {
        ...currentSession,
        user: {
          ...(currentSession?.user || {}),
          name: userData.name,
          phone: userData.phone,
          // Premium status might be in response too, good to sync it
          ...(response.data.user?.premium ? { premium: response.data.user.premium } : {})
        }
      };
      await authService.saveSession(updatedSession);

      Toast.show({ type: 'success', text1: 'Success', text2: 'Profile updated successfully' });
      navigation.goBack();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      {/* Header */}
      {/* Header */}
      <CommonHeader title="Edit Profile" showBack={true} />

      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>
              {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Text style={[styles.changePhotoText, { color: theme.primary }]}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <InputField
            label="Full Name"
            value={userData.name}
            onChange={(t) => setUserData({ ...userData, name: t })}
            icon="person-outline"
            placeholder="Enter your full name"
            theme={theme}
          />
          <InputField
            label="Email Address"
            value={userData.email}
            onChange={(t) => setUserData({ ...userData, email: t })}
            icon="mail-outline"
            placeholder="Enter your email"
            keyboardType="email-address"
            editable={false} // Email cannot be changed
            theme={theme}
          />
          <InputField
            label="Phone Number"
            value={userData.phone}
            onChange={(t) => setUserData({ ...userData, phone: t })}
            icon="call-outline"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            theme={theme}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header styles removed (handled by CommonHeader)

  content: { flex: 1, padding: 20 },

  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  avatarText: { fontSize: 40, fontWeight: 'bold' },
  changePhotoText: { fontSize: 14, fontWeight: '600', fontFamily: 'DMSans-SemiBold' },

  form: { gap: 20 },
  inputContainer: {},
  label: { marginBottom: 8, fontSize: 14, fontFamily: 'DMSans-Medium' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 50
  },
  input: { flex: 1, fontSize: 16, fontFamily: 'DMSans-Regular' },

  footer: { padding: 20, borderTopWidth: 1 },
  saveBtn: {
    borderRadius: 12, height: 50,
    justifyContent: 'center', alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans-Bold' },
});

export default EditProfileScreen;
