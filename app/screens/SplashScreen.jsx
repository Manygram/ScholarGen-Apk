import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

import { authService } from '../services/authService';

const SplashScreen = ({ navigation }) => {
  const { theme } = useTheme();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Wait at least 2 seconds for branding
        await new Promise(resolve => setTimeout(resolve, 2000));

        const session = await authService.getSession();
        if (session && session.token) {
          console.log('[SplashScreen] Valid session found, going to MainTabs');
          navigation.replace('MainTabs');
        } else {
          console.log('[SplashScreen] No session, going to Welcome');
          navigation.replace('Welcome');
        }
      } catch (e) {
        console.warn('[SplashScreen] Session check failed:', e);
        navigation.replace('Welcome');
      }
    };

    checkSession();
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/app-icon-new.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.title, { color: theme.text }]}>ScholarGen UTME 2026</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Learn, Excel and Achieve</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'DMSans-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default SplashScreen;
