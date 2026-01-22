import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import { authService } from '../services/authService';
import CommonHeader from '../components/CommonHeader';
import Toast from 'react-native-toast-message';

const ChangePasswordScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const handleSave = async () => {
    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all fields' });
      return;
    }
    if (data.newPassword !== data.confirmPassword) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Password updated successfully' });
      navigation.goBack();
    } catch (e) {
      // Mock success if API fails (since backend might not be fully ready in some environments)
      // or ensure user knows it failed.
      console.log(e);
      // For smoother UX in this demo context if backend 404s:
      if (e.response && e.response.status === 404) {
        Toast.show({ type: 'error', text1: 'Not Available', text2: 'API endpoint not found' });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update password' });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShow = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const InputField = ({ label, value, onChange, placeholder, show, onToggle }) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} style={{ marginRight: 10 }} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary + '80'}
          secureTextEntry={!show}
        />
        <TouchableOpacity onPress={onToggle}>
          <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      {/* Header */}
      <CommonHeader title="Change Password" showBack={true} />

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <InputField
            label="Current Password"
            value={data.currentPassword}
            onChange={(t) => setData({ ...data, currentPassword: t })}
            placeholder="Enter current password"
            show={showPassword.current}
            onToggle={() => toggleShow('current')}
          />
          <View style={styles.divider} />
          <InputField
            label="New Password"
            value={data.newPassword}
            onChange={(t) => setData({ ...data, newPassword: t })}
            placeholder="Enter new password"
            show={showPassword.new}
            onToggle={() => toggleShow('new')}
          />
          <InputField
            label="Confirm New Password"
            value={data.confirmPassword}
            onChange={(t) => setData({ ...data, confirmPassword: t })}
            placeholder="Re-enter new password"
            show={showPassword.confirm}
            onToggle={() => toggleShow('confirm')}
          />
        </View>

        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Password must be at least 8 characters long and include numbers and symbols.
        </Text>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header styles removed

  content: { flex: 1, padding: 20 },
  form: { gap: 20 },
  divider: { height: 10 },

  inputContainer: {},
  label: { marginBottom: 8, fontSize: 14, fontFamily: 'DMSans-Medium' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 50
  },
  input: { flex: 1, fontSize: 16, fontFamily: 'DMSans-Regular' },

  hint: { marginTop: 24, fontSize: 13, fontFamily: 'DMSans-Regular', lineHeight: 20 },

  footer: { padding: 20, borderTopWidth: 1 },
  saveBtn: {
    borderRadius: 12, height: 50,
    justifyContent: 'center', alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans-Bold' },
});

export default ChangePasswordScreen;
