import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    FlatList,
    Alert,
    Modal,
    ActivityIndicator,
    Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import CommonHeader from "../components/CommonHeader"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from 'react-native-toast-message';

import { useDatabase } from "../context/DatabaseContext"
const API_BASE_URL = "https://api.scholargens.com/api"
const YEARS = Array.from({ length: 2026 - 1994 + 1 }, (_, i) => (2026 - i).toString())

const SubjectSelectionScreen = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme()
    const { categoryTitle } = route.params
    const { subjects: offlineSubjects } = useDatabase()

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
            const response = await axios.get(`${API_BASE_URL}/subjects`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            let subjects = response.data || []

            subjects = subjects.map((sub) => {
                const subName = (sub.name || "").toLowerCase()
                // Normalize names only, do not fake IDs
                if (subName.includes("physics")) {
                    return { ...sub, name: "Physics" }
                }
                if (subName.includes("use of english") || subName === "english") {
                    return { ...sub, name: "English" }
                }
                return sub
            })

            setDbSubjects(subjects)

            const englishObj = subjects.find((s) => (s.name || "").toLowerCase().includes("english"))
            if (englishObj && englishObj.id) {
                // English logic if needed
            }
        } catch (error) {
            console.log("Error fetching subjects:", error)

            // OFFLINE FALLBACK
            if (offlineSubjects && offlineSubjects.length > 0) {
                console.log("Using offline subjects...");
                let cached = offlineSubjects.map((sub) => {
                    const subName = (sub.name || "").toLowerCase()
                    if (subName.includes("physics")) return { ...sub, name: "Physics" }
                    if (subName.includes("use of english") || subName === "english") return { ...sub, name: "English" }
                    return sub
                })
                setDbSubjects(cached)
                Toast.show({
                    type: 'info',
                    text1: 'Offline Mode',
                    text2: 'Loaded subjects from local storage.'
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Connection Error',
                    text2: 'Could not load subjects and no offline data found.'
                });
            }
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
        const subId = (subject.id || "").toString()
        if (!subId) return

        if (subject.name.toLowerCase().includes("english")) {
            Toast.show({
                type: 'info',
                text1: 'Compulsory',
                text2: 'English Language is compulsory.'
            });
            return
        }

        const isSelected = selectedSubjects.some((s) => s.id.toString() === subId)

        if (isSelected) {
            setSelectedSubjects((prev) => prev.filter((s) => s.id.toString() !== subId))
            setSubjectYears((prev) => {
                const newState = { ...prev }
                delete newState[subId]
                return newState
            })
        } else {
            if (selectedSubjects.length >= 4) {
                Toast.show({
                    type: 'info',
                    text1: 'Limit Reached',
                    text2: 'You can verify your knowledge with max 4 subjects.'
                });
            } else {
                const newSub = { id: subId, name: subject.name } // stored as string ID
                setSelectedSubjects((prev) => [...prev, newSub])
                setSubjectYears((prev) => ({
                    ...prev,
                    [subId]: "2023",
                }))
            }
        }
    }

    const openYearModal = (subject) => {
        const subId = (subject.id || "").toString();
        const isSelected = selectedSubjects.some((s) => s.id.toString() === subId)
        if (!isSelected) return
        setCurrentSubjectForYear(subject)
        setYearModalVisible(true)
    }

    const selectYear = (year) => {
        if (currentSubjectForYear && currentSubjectForYear.id) {
            const subId = currentSubjectForYear.id.toString()
            setSubjectYears((prev) => ({
                ...prev,
                [subId]: year,
            }))
        }
        setYearModalVisible(false)
        setCurrentSubjectForYear(null)
    }

    const handleProceed = () => {
        // Relaxed rule: Allow 1-4 subjects. 
        if (selectedSubjects.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Incomplete',
                text2: 'Please select at least one subject.'
            });
            return
        }
        navigation.navigate("ExamConfig", {
            selectedSubjects: selectedSubjects,
            subjectYears: subjectYears,
        })
    }

    const renderItem = ({ item }) => {
        const itemId = (item.id || "").toString();
        const isSelected = selectedSubjects.some((s) => s.id.toString() === itemId)
        const selectedYear = subjectYears[itemId]

        return (
            <View
                style={[
                    styles.itemContainer,
                    { backgroundColor: theme.card, borderColor: isSelected ? theme.primary : theme.border },
                ]}
            >
                <TouchableOpacity style={styles.subjectRow} onPress={() => toggleSubject(item)} activeOpacity={0.7}>
                    <View
                        style={[
                            styles.checkbox,
                            {
                                borderColor: isSelected ? theme.primary : theme.textSecondary,
                                backgroundColor: isSelected ? theme.primary : "transparent",
                            },
                        ]}
                    >
                        {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <Text style={[styles.itemText, { color: theme.text, fontFamily: isSelected ? 'DMSans-Bold' : 'DMSans-Medium' }]}>{item.name}</Text>
                </TouchableOpacity>

                {isSelected && (
                    <TouchableOpacity
                        style={[styles.yearDropdown, { backgroundColor: theme.background, borderColor: theme.border }]}
                        onPress={() => openYearModal(item)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.yearText, { color: selectedYear ? theme.text : theme.textSecondary }]}>
                            {selectedYear || "2023"}
                        </Text>
                        <Ionicons name="chevron-down" size={14} color={theme.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
        )
    }

    if (loading) return (
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            <CommonHeader title="Select Subjects" showBack={true} />

            <View style={styles.subHeader}>
                <Text style={[styles.subHeaderTitle, { color: theme.text }]}>Customize Your Test</Text>
                <Text style={styles.subHeaderText}>Select up to 4 subjects to practice.</Text>
            </View>

            <FlatList
                data={dbSubjects}
                renderItem={renderItem}
                keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                extraData={selectedSubjects} // Ensure re-render on selection change
            />

            <View style={[styles.footer, { backgroundColor: theme.card }]}>
                <TouchableOpacity
                    style={[
                        styles.proceedButton,
                        { backgroundColor: selectedSubjects.length > 0 ? theme.primary : theme.disabled || "#ccc", opacity: selectedSubjects.length > 0 ? 1 : 0.7 }
                    ]}
                    onPress={handleProceed}
                    disabled={selectedSubjects.length === 0}
                    activeOpacity={0.8}
                >
                    <Text style={styles.proceedButtonText}>Start Practice ({selectedSubjects.length})</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <Modal
                transparent={true}
                visible={yearModalVisible}
                animationType="fade"
                onRequestClose={() => setYearModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                Select Year
                            </Text>
                            <TouchableOpacity onPress={() => setYearModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={YEARS}
                            keyExtractor={(item) => item}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[styles.yearItem, { borderBottomColor: theme.border }]} onPress={() => selectYear(item)}>
                                    <Text style={[styles.yearTextDropdown, { color: theme.text }]}>{item}</Text>
                                    {currentSubjectForYear && subjectYears[currentSubjectForYear.id] === item && (
                                        <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                                    )}
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
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    // Header styles removed

    subHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    subHeaderTitle: { fontSize: 22, marginBottom: 6, fontFamily: 'DMSans-Bold' },
    subHeaderText: { fontSize: 15, color: '#666', fontFamily: 'DMSans-Regular' },

    listContent: { padding: 20, paddingBottom: 100 },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        justifyContent: "space-between",
    },
    subjectRow: { flexDirection: "row", alignItems: "center", flex: 1 },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    itemText: { fontSize: 16, flexShrink: 1 },
    yearDropdown: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        marginLeft: 10,
        gap: 6,
    },
    yearText: { fontSize: 14, fontFamily: 'DMSans-Medium' },

    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
        position: "absolute", bottom: 0, left: 0, right: 0
    },
    proceedButton: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 10,
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    proceedButtonText: { color: "#fff", fontSize: 16, fontFamily: 'DMSans-Bold' },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '60%',
        borderRadius: 24,
        padding: 24,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: { fontSize: 18, fontFamily: 'DMSans-Bold' },
    yearItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    yearTextDropdown: { fontSize: 16, fontFamily: 'DMSans-Medium' },
})

export default SubjectSelectionScreen
