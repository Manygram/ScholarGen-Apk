import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import CustomInput from '../components/CustomInput';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen({ navigation }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your email address'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { status, data } = await authService.forgotPassword(email);
      if (status === 200 || status === 201) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'OTP code sent to your email.'
        });
        setStep(2);
      } else {
        throw new Error(data?.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.log("Forgot Password Error:", error);
      const errorMsg = error.response?.data?.message || error.data?.message || error.message || 'Network error occurred';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter both OTP and new password'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { status, data } = await authService.resetPassword(email, otp, newPassword);
      if (status === 200 || status === 201) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Password reset successful!'
        });
        navigation.navigate('Welcome');
      } else {
        throw new Error(data?.message || 'Failed to reset password');
      }
    } catch (error) {
      console.log("Reset Password Error:", error);
      const errorMsg = error.response?.data?.message || error.data?.message || error.message || 'Network error occurred';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {step === 1
              ? "Don't worry! Enter your email and we'll send you an OTP to reset your password."
              : `Enter the OTP sent to ${email} and your new password.`
            }
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {step === 1 ? (
              <CustomInput
                icon="mail-outline"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <>
                <CustomInput
                  icon="key-outline"
                  placeholder="Enter OTP Code"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <CustomInput
                  icon="lock-closed-outline"
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  isPassword={true}
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.primary, opacity: isLoading ? 0.7 : 1 }]}
              onPress={step === 1 ? handleSendOtp : handleResetPassword}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {step === 1 ? 'Send OTP' : 'Reset Password'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLoginContainer}
              onPress={() => navigation.navigate('Welcome')}
              activeOpacity={0.8}
            >
              <Text style={[styles.backToLoginText, { color: theme.textSecondary }]}>
                Remember your password?{' '}
              </Text>
              <Text style={[styles.backToLoginLink, { color: theme.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logo at bottom */}
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: theme.primary }]}>ScholarGen</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'DMSans-Bold',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'DMSans-Regular',
  },
  form: {
    flex: 1,
  },
  submitButton: {
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'DMSans-Bold',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
  },
  backToLoginLink: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Bold',
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 'auto',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Bold',
  },
});