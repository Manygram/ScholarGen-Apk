"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"

import { authService } from "../services/authService"
import CustomInput from "../components/CustomInput"

const SignUpScreen = () => {
  const navigation = useNavigation()
  const { theme } = useTheme()

  // 1. State includes referralCode
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    referralCode: "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSignUp = async () => {
    // Basic validation (Referral code is optional, so we exclude it here)
    if (!formData.fullName || !formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      // 2. Prepare data: Trim the referral code to remove accidental spaces
      const cleanReferralCode = formData.referralCode ? formData.referralCode.trim() : ""

      const { status, data } = await authService.register(
        formData.fullName,
        formData.email,
        formData.password,
        cleanReferralCode, // Pass the clean code
      )

      if (status === 200 || status === 201) {
        Alert.alert("Success", "Account created! Please verify your email.")
        navigation.navigate("Verification", { email: formData.email })
      } else {
        Alert.alert("Registration Failed", data.message || "Could not create account.")
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.data?.message || error.message || "Something went wrong. Please check your connection."
      Alert.alert("Error", errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 3. Corrected Title to "Hello there" */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Hello there</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Create your account</Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            icon="person-outline"
            placeholder="John Doe"
            value={formData.fullName}
            onChangeText={(value) => handleInputChange("fullName", value)}
          />

          <CustomInput
            icon="mail-outline"
            placeholder="johndoe@gmail.com"
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            keyboardType="email-address"
          />

          <CustomInput
            icon="lock-closed-outline"
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(value) => handleInputChange("password", value)}
            isPassword={true}
          />

          {/* Referral Code Input */}
          <CustomInput
            icon="pricetag-outline"
            placeholder="Referral Code (Optional)"
            value={formData.referralCode}
            onChangeText={(value) => handleInputChange("referralCode", value)}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={[styles.signUpButton, { backgroundColor: theme.primary }]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: theme.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={[styles.loginLink, { color: theme.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: "flex-start",
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  signUpButton: {
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 30,
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
    color: "#666",
  },
  loginLink: {
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default SignUpScreen
