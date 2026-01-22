import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import CustomInput from '../components/CustomInput';
import Toast from 'react-native-toast-message';

const WelcomeScreen = ({ navigation }) => {
  console.log('[WelcomeScreen] Rendering...');
  console.log('[WelcomeScreen] Navigation:', navigation ? 'Available' : 'UNDEFINED');

  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    referralCode: '',
  });

  // Load saved email on mount
  useEffect(() => {
    loadSavedEmail();
  }, []);

  const loadSavedEmail = async () => {
    const savedEmail = await authService.getSavedEmail();
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields'
      });
      return false;
    }
    if (activeTab === 'signup' && !formData.fullName) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your full name'
      });
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authService.login(formData.email, formData.password);
      const { data } = response;

      if (data) {
        const token = data.accessToken || data.token || data.user?.token;
        if (!token) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Login failed. Please try again.'
          });
          return;
        }

        const sessionData = { ...(data.user || data), token };
        await authService.saveSession(sessionData);

        // Navigate to main app
        navigation.replace('MainTabs');
      }
    } catch (error) {
      console.error('[WelcomeScreen] Login error:', error);
      const errorMsg = error.response?.data?.message || error.data?.message || error.message || 'Please check your credentials';
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const cleanReferralCode = formData.referralCode ? formData.referralCode.trim() : '';

      const { status, data } = await authService.register(
        formData.fullName,
        formData.email,
        formData.password,
        cleanReferralCode
      );

      if (status === 200 || status === 201) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Account created! Please verify your email.'
        });
        navigation.navigate('Verification', { email: formData.email });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: data.message || 'Could not create account.'
        });
      }
    } catch (error) {
      console.error('[WelcomeScreen] Registration error:', error);
      const errorMsg = error.response?.data?.message || error.data?.message || error.message || 'Registration failed';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'signin') {
      handleSignIn();
    } else {
      handleSignUp();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Welcome to ScholarGen</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Your path to UTME success
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'signin' && [styles.activeTab, { backgroundColor: theme.card }]]}
            onPress={() => setActiveTab('signin')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: activeTab === 'signin' ? theme.primary : theme.textSecondary }]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'signup' && [styles.activeTab, { backgroundColor: theme.card }]]}
            onPress={() => setActiveTab('signup')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: activeTab === 'signup' ? theme.primary : theme.textSecondary }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {activeTab === 'signup' && (
            <CustomInput
              icon="person"
              placeholder="Full Name"
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
            />
          )}

          <CustomInput
            icon="mail-outline"
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomInput
            icon="lock-closed-outline"
            placeholder="Password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            isPassword={true}
          />

          {activeTab === 'signup' && (
            <CustomInput
              icon="pricetag-outline"
              placeholder="Referral Code (Optional)"
              value={formData.referralCode}
              onChangeText={(value) => handleInputChange('referralCode', value)}
              autoCapitalize="characters"
            />
          )}

          {activeTab === 'signin' && (
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.8}
            >
              <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {activeTab === 'signin' ? 'Sign In' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Logo at bottom center */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/app-icon-new.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
    fontFamily: 'DMSans-Bold',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans-SemiBold',
  },
  form: {
    flex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 'auto',
  },
  logo: {
    width: 120,
    height: 120,
  },
});

export default WelcomeScreen;
