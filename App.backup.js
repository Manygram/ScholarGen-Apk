import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
// import { useFonts } from 'expo-font';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './app/context/ThemeContext';
import { DatabaseProvider } from './app/context/DatabaseContext';

// Import all screens
import SplashScreen from './app/screens/SplashScreen.jsx';
import WelcomeScreen from './app/screens/WelcomeScreen.jsx';
import LoginScreen from './app/screens/LoginScreen.jsx';
import ErrorScreen from './app/screens/ErrorScreen.jsx';
import ForgotPasswordScreen from './app/screens/ForgotPasswordScreen.jsx';
import VerificationScreen from './app/screens/VerificationScreen.jsx';
import SignUpScreen from './app/screens/SignUpScreen.jsx';
import CalculatorScreen from './app/screens/CalculatorScreen.jsx';
import MainTabNavigator from './app/navigation/MainTabNavigator.jsx';
import SubjectVideosScreen from './app/screens/SubjectVideosScreen.jsx';
import ExamCategoryScreen from './app/screens/ExamCategoryScreen.jsx';
import SubjectSelectionScreen from './app/screens/SubjectSelectionScreen.jsx';
import QuizScreen from './app/screens/QuizScreen.jsx';

const Stack = createStackNavigator();

// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();


export default function App() {
  const onLayoutRootView = useCallback(async () => {
    await ExpoSplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider>
      <DatabaseProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator initialRouteName="Splash">
              <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Verification" component={VerificationScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Error" component={ErrorScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Calculator" component={CalculatorScreen} options={{ headerShown: false }} />
              <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
              <Stack.Screen name="SubjectVideos" component={SubjectVideosScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ExamCategory" component={ExamCategoryScreen} options={{ headerShown: false }} />
              <Stack.Screen name="SubjectSelection" component={SubjectSelectionScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Quiz" component={QuizScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
