import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingOverlay from '../components/LoadingOverlay';
import { authService } from '../services/authService';

const VerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = code.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      if (!email) {
        Alert.alert("Error", "No email provided for verification.");
        return;
      }

      console.log('Verifying OTP with:', { email, otp: otpCode });
      const { status, data } = await authService.verify(email, otpCode);

      if (status === 200 || status === 201) {
        // Verification successful
        // Optionally save token/login immediately if API returns it, or navigate to login
        Alert.alert('Success', 'Account verified successfully!');
        navigation.navigate('Login'); // Navigate to Login to sign in fresh, or MainTabs if auto-logged in
      } else {
        Alert.alert('Verification Failed', data.message || 'Invalid code.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Network Error', 'Failed to verify code. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const emailToUse = email || await AsyncStorage.getItem('registrationEmail');

      if (!emailToUse) {
        Alert.alert('Error', 'Email not found. Please try registering again.');
        return;
      }

      const { status, data } = await authService.resendOTP(emailToUse);

      if (status === 200 || status === 201) {
        Alert.alert('Success', 'Verification code resent successfully!');
      } else {
        const errorMessage = data?.message || data?.error || 'Failed to resend verification code.';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to resend verification code. Please try again.';
      Alert.alert('Error', errorMsg);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>
          We sent a verification code to your{'\n'}email address
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => inputRefs.current[index] = ref}
              style={[
                styles.codeInput,
                digit ? styles.codeInputFilled : null
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              placeholderTextColor="#ccc"
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          <Text style={styles.verifyButtonText}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.brandText}>ScholarGen</Text>
      </View>
      <LoadingOverlay visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  codeInputFilled: {
    borderColor: '#1976D2',
    backgroundColor: '#F3F8FF',
  },
  verifyButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
});

export default VerificationScreen;