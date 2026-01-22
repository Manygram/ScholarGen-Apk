import React, { useRef, useState } from 'react';
import { View, TextInput, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const CustomInput = ({
    value,
    onChangeText,
    placeholder,
    icon,
    isPassword,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    ...props
}) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Animation value for border color transition (0 to 1)
    const focusAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(focusAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false, // Border color doesn't support native driver
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.timing(focusAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    // Interpolate border color from theme.border (grey) to theme.primary (blue/gold)
    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.border || '#E0E0E0', theme.primary || '#FFC107']
    });

    // Interpolate background color slightly if needed, but keeping it simple for now

    return (
        <Animated.View style={[
            styles.container,
            {
                borderColor: borderColor,
                backgroundColor: theme.card || '#F5F5F5' // Light greyish background
            }
        ]}>
            {icon && (
                <Ionicons
                    name={icon}
                    size={20}
                    color={isFocused ? theme.primary : theme.textSecondary}
                    style={styles.icon}
                />
            )}

            <TextInput
                style={[styles.input, { color: theme.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999999"
                onFocus={handleFocus}
                onBlur={handleBlur}
                secureTextEntry={isPassword && !showPassword}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                cursorColor={theme.primary} // Make cursor match primary color (Gold/Blue)
                selectionColor={theme.primary}
                {...props}
            />

            {isPassword && (
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} activeOpacity={0.8}>
                    <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color={theme.textSecondary}
                    />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5, // Slightly thicker for effect
        borderRadius: 14, // Rounded corners
        paddingHorizontal: 15,
        marginBottom: 16,
        height: 55, // Taller comfortable touch target
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
        fontFamily: 'DMSans-Regular',
    },
    eyeIcon: {
        padding: 5,
    }
});

export default CustomInput;
