import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const CommonHeader = ({
    title,
    subtitle,
    showBack = false,
    onBack,
    rightComponent,
}) => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <View style={styles.leftContainer}>
                {showBack && (
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                )}
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
                    {subtitle && <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>{subtitle}</Text>}
                </View>
            </View>

            {rightComponent && (
                <View style={styles.rightContainer}>
                    {rightComponent}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
        borderBottomWidth: 0,
    },
    leftContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
    backBtn: { marginRight: 16, padding: 4 },
    headerTitle: { fontSize: 20, fontFamily: 'DMSans-Bold', lineHeight: 28 },
    headerSubtitle: { fontSize: 13, fontFamily: 'DMSans-Regular', marginTop: 0 },
    rightContainer: { alignSelf: 'center' },
});

export default CommonHeader;
