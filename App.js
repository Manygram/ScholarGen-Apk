import React, { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as ExpoSplashScreen from "expo-splash-screen";
import { ThemeProvider } from "./app/context/ThemeContext";
import { DatabaseProvider } from "./app/context/DatabaseContext";
import { AuthProvider } from "./app/context/AuthContext";

// 👉 NOTE: Imported the IAP Context wrapper here
import { withIAPContext } from "react-native-iap";

// Import all screens
import SplashScreen from "./app/screens/SplashScreen.jsx";
import WelcomeScreen from "./app/screens/WelcomeScreen.jsx";
import LoginScreen from "./app/screens/LoginScreen.jsx";
import SignUpScreen from "./app/screens/SignUpScreen.jsx";

import ForgotPasswordScreen from "./app/screens/ForgotPasswordScreen.jsx";
import VerificationScreen from "./app/screens/VerificationScreen.jsx";
import CalculatorScreen from "./app/screens/CalculatorScreen.jsx";
import MainTabNavigator from "./app/navigation/MainTabNavigator.jsx";
import SubjectVideosScreen from "./app/screens/SubjectVideosScreen.jsx";
import ExamCategoryScreen from "./app/screens/ExamCategoryScreen.jsx";
import SubjectSelectionScreen from "./app/screens/SubjectSelectionScreen.jsx";
import ExamConfigScreen from "./app/screens/ExamConfigScreen.jsx";
import GamesScreen from "./app/screens/GamesScreen.jsx";
import ActivationScreen from "./app/screens/ActivationScreen.jsx";
import StudyContentScreen from "./app/screens/StudyContentScreen.jsx";
import QuizScreen from "./app/screens/QuizScreen.jsx";
import FlashCardScreen from "./app/screens/FlashCardScreen.jsx";
import NotificationScreen from "./app/screens/NotificationScreen.jsx";
import LiteratureScreen from "./app/screens/LiteratureScreen.jsx";
import LiteratureDetailScreen from "./app/screens/LiteratureDetailScreen.jsx";
import LiteratureContentScreen from "./app/screens/LiteratureContentScreen.jsx";
import StudyMaterialsScreen from "./app/screens/StudyMaterialsScreen.jsx";
import StudyMaterialDetailScreen from "./app/screens/StudyMaterialDetailScreen.jsx";
import PDFViewerScreen from "./app/screens/PDFViewerScreen.jsx";
import EditProfileScreen from "./app/screens/EditProfileScreen";
import ChangePasswordScreen from "./app/screens/ChangePasswordScreen";
import SubscriptionScreen from "./app/screens/SubscriptionScreen";
import HelpSupportScreen from "./app/screens/HelpSupportScreen";
import VideoTopicsScreen from "./app/screens/VideoTopicsScreen";
import VideoListScreen from "./app/screens/VideoListScreen";
import VideoPlayerScreen from "./app/screens/VideoPlayerScreen";
import QuizCorrectionScreen from "./app/screens/QuizCorrectionScreen";
import Toast from "react-native-toast-message";

import { useNavigation, useNavigationContainerRef } from "@react-navigation/native";
import { useAuth } from "./app/context/AuthContext";

const Stack = createStackNavigator();

// Separate component to start using Hooks (useAuth, useNavigation)
const AppNavigator = ({ initialRoute }) => {
  const { user, loading } = useAuth();
  const navigation = useNavigation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Listen for unexpected logout (e.g. session expiry)
  useEffect(() => {
    if (isMounted && !loading && !user) {
      console.log("[AppNavigator] User logged out, resetting to Welcome");
      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
    }
  }, [user, loading, isMounted]);

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Verification" component={VerificationScreen} options={{ headerShown: false }} />

      <Stack.Screen name="Calculator" component={CalculatorScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="SubjectVideos" component={SubjectVideosScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExamCategory" component={ExamCategoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SubjectSelection" component={SubjectSelectionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ExamConfig" component={ExamConfigScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Games" component={GamesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Activation" component={ActivationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StudyContent" component={StudyContentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FlashCard" component={FlashCardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerShown: false }} />

      <Stack.Screen name="Literature" component={LiteratureScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LiteratureDetail" component={LiteratureDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LiteratureContent" component={LiteratureContentScreen} options={{ headerShown: false }} />

      <Stack.Screen name="StudyMaterials" component={StudyMaterialsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StudyMaterialDetail" component={StudyMaterialDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PDFViewer" component={PDFViewerScreen} options={{ headerShown: false }} />

      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />

      <Stack.Screen name="VideoTopics" component={VideoTopicsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VideoList" component={VideoListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="QuizCorrection" component={QuizCorrectionScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

// 👉 NOTE: Changed from `export default function App()` to `const App = () =>` so we can wrap it below
const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState("Splash");

  const [fontsLoaded] = useFonts({
    "DMSans-Regular": require("./assets/fonts/DMSans_18pt-Regular.ttf"),
    "DMSans-Medium": require("./assets/fonts/DMSans_18pt-Medium.ttf"),
    "DMSans-SemiBold": require("./assets/fonts/DMSans_18pt-SemiBold.ttf"),
    "DMSans-Bold": require("./assets/fonts/DMSans_18pt-Bold.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Token check moved to SplashScreen.jsx
      } catch (e) {
        console.warn(e);
      } finally {
        if (fontsLoaded) setIsReady(true);
      }
    }

    if (fontsLoaded) {
      prepare();
    }
  }, [fontsLoaded]);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      console.log("[App] Hiding native splash screen");
      await ExpoSplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <AuthProvider>
        <ThemeProvider>
          <DatabaseProvider>
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <NavigationContainer>
                <StatusBar style="auto" />
                <AppNavigator initialRoute={initialRoute} />
              </NavigationContainer>
            </View>
          </DatabaseProvider>
        </ThemeProvider>
      </AuthProvider>
      <Toast
        text1Style={{
          fontSize: 16,
          fontFamily: "DMSans-Regular",
        }}
        text2Style={{
          fontSize: 16,
          fontFamily: "DMSans-Regular",
        }}
      />
    </>
  );
};

// 👉 NOTE: This wraps your entire app with the in-app purchase context!
export default withIAPContext(App);