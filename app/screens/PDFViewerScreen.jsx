import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from '../components/CommonHeader';

const PDFViewerScreen = ({ navigation, route }) => {
    const { url, title } = route.params || {};
    const { theme, isDarkMode } = useTheme();

    // Use Google Docs Viewer for reliable PDF rendering in WebView
    const pdfUrl = Platform.OS === 'android' 
        ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`
        : url; 

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
            
            <CommonHeader 
                title={title} 
                showBack={true} 
                onBack={() => navigation.goBack()}
                // We can use the default back button icon (arrow-back) or custom.
                // The original had "close" icon. Let's stick to arrow-back for consistency unless strictly required.
                // Or I can add a prop to CommonHeader for icon name? 
                // For now, standardizing to arrow-back is better for global consistency.
            />

            <WebView
                source={{ uri: pdfUrl }}
                style={{ flex: 1 }}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={[styles.loading, { backgroundColor: theme.background }]}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
  // Header styles removed
    loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }
});

export default PDFViewerScreen;
