import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import CustomInput from '../components/CustomInput';
import Toast from 'react-native-toast-message';

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields'
      });
      return;
    }

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

        const sessionData = { ...(data.user || data), token, refreshToken: data.refreshToken };
        await authService.saveSession(sessionData);

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Login successful!'
        });
        navigation.replace('MainTabs');
      }
    } catch (error) {
      console.error('[LoginScreen] Login error:', error);
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
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

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.8}
          >
            <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={[styles.signUpText, { color: theme.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.8}>
              <Text style={[styles.signUpLink, { color: theme.primary }]}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80,
  },
  header: {
    marginBottom: 40,
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
  signInButton: {
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signInButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'DMSans-Bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
  },
  signUpLink: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
  },
});

export default LoginScreen;
