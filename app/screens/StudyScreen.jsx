"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import CommonHeader from "../components/CommonHeader"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const API_BASE_URL = "https://api.scholargens.com/api"
const YEARS = Array.from({ length: 2025 - 1994 + 1 }, (_, i) => (2025 - i).toString())

const StudyScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme()

  const [dbSubjects, setDbSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [subjectYears, setSubjectYears] = useState({})
  const [yearModalVisible, setYearModalVisible] = useState(false)
  const [currentSubjectForYear, setCurrentSubjectForYear] = useState(null)

  // Refresh Control
  const [refreshing, setRefreshing] = useState(false)

  const fetchSubjects = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      
      const token = await AsyncStorage.getItem("userToken")
      if (!token) {
        setLoading(false)
        setRefreshing(false)
        return
      }
      const response = await axios.get(`${API_BASE_URL}/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      let subjects = response.data || []

      subjects = subjects.map((sub) => {
        if (sub.name && sub.name.toLowerCase().includes("physics")) {
          return { ...sub, _id: "695780098f1e7a1a3a935f07", name: "Physics" }
        }
        return sub
      })

      setDbSubjects(subjects)
    } catch (error) {
      console.log("Study Mode Fetch Error:", error)
      Alert.alert("Error", "Could not load subjects for study mode.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const onRefresh = () => {
    fetchSubjects(true)
  }

  const toggleSubject = (subject) => {
    const subId = (subject._id || "").toString()
    if (!subId) return

    const isSelected = selectedSubjects.some((s) => s._id === subId)

    if (isSelected) {
      setSelectedSubjects((prev) => prev.filter((s) => s._id !== subId))
      setSubjectYears((prev) => {
        const newState = { ...prev }
        delete newState[subId]
        return newState
      })
    } else {
      if (selectedSubjects.length >= 4) {
        Alert.alert("Limit Reached", "You can only select a maximum of 4 subjects.")
      } else {
        setSelectedSubjects((prev) => [...prev, subject])
      }
    }
  }

  const openYearModal = (subject) => {
    const isSelected = selectedSubjects.some((s) => s._id === subject._id)
    if (!isSelected) {
      Alert.alert("Select Subject", "Please select the subject first before choosing a year.")
      return
    }
    setCurrentSubjectForYear(subject)
    setYearModalVisible(true)
  }

  const selectYear = (year) => {
    if (currentSubjectForYear) {
      setSubjectYears((prev) => ({
        ...prev,
        [currentSubjectForYear._id.toString()]: year,
      }))
    }
    setYearModalVisible(false)
    setCurrentSubjectForYear(null)
  }

  const isProceedEnabled = () => {
    if (selectedSubjects.length === 0) return false
    const everySubjectHasYear = selectedSubjects.every((sub) => subjectYears[sub._id])
    return everySubjectHasYear
  }

  const handleProceed = () => {
    if (!isProceedEnabled()) {
      Alert.alert("Incomplete", "Please select at least one subject and ensure a year is selected for it.")
      return
    }

    navigation.navigate("ExamConfig", {
      selectedSubjects,
      subjectYears,
    })
  }

  const renderItem = ({ item }) => {
    const isSelected = selectedSubjects.some((s) => s._id === item._id)
    const selectedYear = subjectYears[item._id]

    return (
      <View
        style={[
          styles.itemContainer,
          { backgroundColor: theme.card, borderColor: isSelected ? theme.primary : theme.border },
        ]}
      >
        <TouchableOpacity style={styles.subjectRow} onPress={() => toggleSubject(item)}>
          <View
            style={[
              styles.checkbox,
              {
                borderColor: isSelected ? theme.primary : theme.textSecondary,
                backgroundColor: isSelected ? theme.primary : "transparent",
              },
            ]}
          >
            {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={[styles.itemText, { color: theme.text }]}>{item.name}</Text>
        </TouchableOpacity>

        {isSelected && (
          <TouchableOpacity
            style={[styles.yearDropdown, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={() => openYearModal(item)}
          >
            <Text style={[styles.yearText, { color: selectedYear ? theme.text : theme.textSecondary }]}>
              {selectedYear || "Select Year"}
            </Text>
            <Ionicons name="chevron-down" size={14} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} color={theme.primary} />

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      {/* Header */}
      {/* Header */}
      <CommonHeader 
        title="Study Library"
        subtitle="Select at least 1 subject to start studying."
        showBack={false}
      />

      <FlatList
        data={dbSubjects}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        extraData={{ selectedSubjects, subjectYears }}
        style={{ flex: 1 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Conditional Result/Proceed Button */}
      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.proceedButton,
            { backgroundColor: isProceedEnabled() ? theme.primary : theme.disabled || "#999" },
          ]}
          onPress={handleProceed}
          disabled={!isProceedEnabled()}
        >
          <Text style={styles.proceedButtonText}>Start Studying</Text>
          <Ionicons name="book" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Year Selection Modal */}
      <Modal
        transparent={true}
        visible={yearModalVisible}
        animationType="slide"
        onRequestClose={() => setYearModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Select Year for {currentSubjectForYear ? currentSubjectForYear.name : ""}
              </Text>
              <TouchableOpacity onPress={() => setYearModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={YEARS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.yearItem, { borderBottomColor: theme.border }]}
                  onPress={() => selectYear(item)}
                >
                  <Text style={[styles.yearTextDropdown, { color: theme.text }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header styles removed
  listContent: { padding: 20, paddingBottom: 100 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    justifyContent: "space-between",
    minHeight: 60,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemText: { fontSize: 16, fontWeight: "500", flexShrink: 1 },
  yearDropdown: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 10,
    minWidth: 90,
    justifyContent: "space-between",
  },
  yearText: { fontSize: 12 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  proceedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "50%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  yearItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  yearTextDropdown: {
    fontSize: 16,
    textAlign: "center",
  },
})

export default StudyScreen
