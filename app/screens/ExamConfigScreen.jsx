import React, { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Platform, TextInput, Modal, FlatList, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Slider from '@react-native-community/slider'
import * as Haptics from 'expo-haptics'
import { useTheme } from "../context/ThemeContext"
import Toast from 'react-native-toast-message'
import axios from 'axios'
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.scholargens.com/api'

const ExamConfigScreen = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme()

    // Get initial subjects from route params (if navigating from old flow)
    const initialSubjects = route.params?.selectedSubjects || []

    const [selectedMode, setSelectedMode] = useState("practice")
    const [duration, setDuration] = useState(120)
    const [availableYears, setAvailableYears] = useState({}) // { subjectId: [years] }
    const [selectedYears, setSelectedYears] = useState({}) // { subjectId: year }
    const [questionCounts, setQuestionCounts] = useState({}) // { subjectId: count }
    const [loading, setLoading] = useState(false)

    // Track previous duration for haptic feedback
    const prevDurationRef = useRef(duration)

    // Subject selection state
    const [allSubjects, setAllSubjects] = useState([])
    const [selectedSubjects, setSelectedSubjects] = useState(initialSubjects)
    const [subjectModalVisible, setSubjectModalVisible] = useState(false)
    const [loadingSubjects, setLoadingSubjects] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Custom dropdown state
    const [activeYearDropdown, setActiveYearDropdown] = useState(null)
    const [activeQuestionDropdown, setActiveQuestionDropdown] = useState(null)

    useEffect(() => {
        fetchAllSubjects()
    }, [])

    useEffect(() => {
        if (selectedSubjects.length > 0) {
            fetchAvailableYears()
        }
    }, [selectedSubjects])

    const fetchAllSubjects = async () => {
        try {
            setLoadingSubjects(true)
            const token = await AsyncStorage.getItem('userToken')
            const response = await axios.get(`${API_BASE_URL}/subjects`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            let subjects = response.data || []

            // Normalize subject names
            subjects = subjects.map((sub) => {
                const subName = (sub.name || "").toLowerCase()
                if (subName.includes("physics")) {
                    return { ...sub, name: "Physics" }
                }
                if (subName.includes("use of english") || subName === "english") {
                    return { ...sub, name: "English" }
                }
                return sub
            })

            setAllSubjects(subjects)
        } catch (error) {
            console.error('Error fetching subjects:', error)
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load subjects'
            })
        } finally {
            setLoadingSubjects(false)
        }
    }

    const fetchAvailableYears = async () => {
        if (selectedSubjects.length === 0) {
            return // Don't fetch if no subjects selected
        }

        try {
            setLoading(true)
            const subjectIds = selectedSubjects.map(s => s.id).join(',')
            const token = await AsyncStorage.getItem('userToken')

            const response = await axios.get(`${API_BASE_URL}/questions/available-years?subjectIds=${subjectIds}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            // Transform to { subjectId: [years] }
            const yearsMap = {}
            const defaultYears = {}
            const defaultCounts = {}

            response.data.forEach(item => {
                yearsMap[item.subjectId] = item.years
                // Set default to most recent year
                defaultYears[item.subjectId] = item.years[0] || new Date().getFullYear()

                // Find subject to check if it's English
                const subject = selectedSubjects.find(s => s.id === item.subjectId)
                const isEnglish = subject && (subject.name || '').toLowerCase().includes('english')
                defaultCounts[item.subjectId] = isEnglish ? 60 : 40
            })

            setAvailableYears(yearsMap)
            setSelectedYears(defaultYears)
            setQuestionCounts(defaultCounts)
        } catch (error) {
            console.error('Error fetching available years:', error)
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load available years'
            })

            // Fallback to current year
            const fallbackYears = {}
            const fallbackCounts = {}
            selectedSubjects.forEach(sub => {
                fallbackYears[sub.id] = new Date().getFullYear()
                const isEnglish = (sub.name || '').toLowerCase().includes('english')
                fallbackCounts[sub.id] = isEnglish ? 60 : 40
            })
            setSelectedYears(fallbackYears)
            setQuestionCounts(fallbackCounts)
        } finally {
            setLoading(false)
        }
    }

    const toggleSubject = (subject) => {
        const isSelected = selectedSubjects.some(s => s.id === subject.id)

        if (isSelected) {
            setSelectedSubjects(prev => prev.filter(s => s.id !== subject.id))
            // Remove year and count for this subject
            setSelectedYears(prev => {
                const newYears = { ...prev }
                delete newYears[subject.id]
                return newYears
            })
            setQuestionCounts(prev => {
                const newCounts = { ...prev }
                delete newCounts[subject.id]
                return newCounts
            })
        } else {
            if (selectedSubjects.length >= 4) {
                Toast.show({
                    type: 'info',
                    text1: 'Subject Limit Reached',
                    text2: 'You can only select a maximum of 4 subjects.'
                })
                return
            }
            setSelectedSubjects(prev => [...prev, subject])
        }
    }

    const handleStartQuiz = () => {
        if (selectedSubjects.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select at least one subject.'
            })
            return
        }

        if (selectedMode === "exam" && (isNaN(duration) || duration < 10)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Duration',
                text2: 'Minimum exam time is 10 minutes.'
            })
            return
        }

        const formattedSubjects = selectedSubjects.map((sub) => {
            return {
                subjectId: sub.id.toString(),
                year: selectedYears[sub.id] || new Date().getFullYear(),
                numberOfQuestions: questionCounts[sub.id] || 10,
            }
        })

        navigation.navigate("Quiz", {
            subjects: formattedSubjects,
            originalSubjects: selectedSubjects,
            mode: selectedMode,
            duration: selectedMode === "exam" ? duration : 30,
        })
    }

    const formatDuration = (mins) => {
        const hrs = Math.floor(mins / 60)
        const m = mins % 60
        if (hrs > 0 && m > 0) return `${hrs}h ${m}m`
        if (hrs > 0) return `${hrs}h`
        return `${m}m`
    }

    const updateQuestionCount = (subjectId, value) => {
        setQuestionCounts(prev => ({ ...prev, [subjectId]: parseInt(value) }))
    }

    const handleDurationChange = (value) => {
        const roundedValue = Math.round(value)

        // Trigger haptic feedback only when value changes (not on every slide event)
        if (roundedValue !== prevDurationRef.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            prevDurationRef.current = roundedValue
        }

        setDuration(roundedValue)
    }

    const renderSubjectItem = ({ item }) => {
        const isSelected = selectedSubjects.some(s => s.id === item.id)

        return (
            <TouchableOpacity
                style={[
                    styles.subjectModalItem,
                    {
                        backgroundColor: theme.background,
                        borderColor: isSelected ? theme.primary : theme.border
                    }
                ]}
                onPress={() => toggleSubject(item)}
            >
                <View style={[
                    styles.checkbox,
                    {
                        borderColor: isSelected ? theme.primary : theme.textSecondary,
                        backgroundColor: isSelected ? theme.primary : 'transparent'
                    }
                ]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={[styles.subjectModalText, { color: theme.text }]}>{item.name}</Text>
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Exam Configuration</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Subject Selection Button */}
                <TouchableOpacity
                    style={[styles.selectSubjectsBtn, { backgroundColor: theme.card, borderColor: theme.primary }]}
                    onPress={() => setSubjectModalVisible(true)}
                >
                    <View style={styles.selectSubjectsContent}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
                            <Ionicons name="add-circle" size={24} color={theme.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.selectSubjectsTitle, { color: theme.text }]}>
                                {selectedSubjects.length > 0 ? 'Manage Subjects' : 'Select Subjects'}
                            </Text>
                            <Text style={[styles.selectSubjectsDesc, { color: theme.textSecondary }]}>
                                {selectedSubjects.length > 0
                                    ? `${selectedSubjects.length} subject${selectedSubjects.length > 1 ? 's' : ''} selected`
                                    : 'Tap to choose subjects for your exam'
                                }
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </View>
                </TouchableOpacity>

                {/* Selected Subjects Section */}
                {selectedSubjects.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Selected Subjects</Text>

                        {selectedSubjects.map((sub, index) => {
                            const years = availableYears[sub.id] || []
                            const selectedYear = selectedYears[sub.id] || new Date().getFullYear()
                            const questionCount = questionCounts[sub.id] || 10

                            return (
                                <View key={sub.id || index} style={[styles.subjectCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                    <View style={styles.subjectHeader}>
                                        <View style={styles.tagDot} />
                                        <Text style={[styles.subjectName, { color: theme.text }]}>{sub.name}</Text>
                                        <TouchableOpacity
                                            onPress={() => toggleSubject(sub)}
                                            style={styles.removeBtn}
                                        >
                                            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Year Selector */}
                                    <View style={styles.configRow}>
                                        <Text style={[styles.configLabel, { color: theme.textSecondary }]}>Year</Text>
                                        <View>
                                            <TouchableOpacity
                                                style={[styles.customDropdown, { backgroundColor: theme.background, borderColor: theme.border }]}
                                                onPress={() => setActiveYearDropdown(activeYearDropdown === sub.id ? null : sub.id)}
                                            >
                                                <Text style={[styles.dropdownText, { color: theme.text }]}>{selectedYear}</Text>
                                                <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
                                            </TouchableOpacity>

                                            {activeYearDropdown === sub.id && (
                                                <View style={[styles.dropdownMenu, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                                                        {(years.length > 0 ? years : [new Date().getFullYear()]).map(year => (
                                                            <TouchableOpacity
                                                                key={year}
                                                                style={[styles.dropdownItem, selectedYear === year && { backgroundColor: theme.primary + '15' }]}
                                                                onPress={() => {
                                                                    setSelectedYears(prev => ({ ...prev, [sub.id]: year }))
                                                                    setActiveYearDropdown(null)
                                                                }}
                                                            >
                                                                <Text style={[styles.dropdownItemText, { color: selectedYear === year ? theme.primary : theme.text }]}>
                                                                    {year}
                                                                </Text>
                                                                {selectedYear === year && <Ionicons name="checkmark" size={16} color={theme.primary} />}
                                                            </TouchableOpacity>
                                                        ))}
                                                    </ScrollView>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Question Count */}
                                    <View style={styles.configRow}>
                                        <Text style={[styles.configLabel, { color: theme.textSecondary }]}>Questions</Text>
                                        <View>
                                            <TouchableOpacity
                                                style={[styles.customDropdown, { backgroundColor: theme.background, borderColor: theme.border }]}
                                                onPress={() => setActiveQuestionDropdown(activeQuestionDropdown === sub.id ? null : sub.id)}
                                            >
                                                <Text style={[styles.dropdownText, { color: theme.text }]}>{questionCount}</Text>
                                                <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
                                            </TouchableOpacity>

                                            {activeQuestionDropdown === sub.id && (
                                                <View style={[styles.dropdownMenu, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                                    {[10, 20, 30, 40, 50, 60].map(count => (
                                                        <TouchableOpacity
                                                            key={count}
                                                            style={[styles.dropdownItem, questionCount === count && { backgroundColor: theme.primary + '15' }]}
                                                            onPress={() => {
                                                                updateQuestionCount(sub.id, count)
                                                                setActiveQuestionDropdown(null)
                                                            }}
                                                        >
                                                            <Text style={[styles.dropdownItemText, { color: questionCount === count ? theme.primary : theme.text }]}>
                                                                {count}
                                                            </Text>
                                                            {questionCount === count && <Ionicons name="checkmark" size={16} color={theme.primary} />}
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                )}

                {/* Mode Selection */}
                {selectedSubjects.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Mode</Text>
                        {[
                            {
                                id: "exam",
                                title: "Exam Mode",
                                icon: "timer",
                                color: "#EF4444",
                                desc: "Timed session. No instant corrections. Simulates real exam conditions.",
                            },
                            {
                                id: "practice",
                                title: "Practice Mode",
                                icon: "book",
                                color: "#10B981",
                                desc: "Untimed. See instant explanations as you answer questions.",
                            },
                        ].map((m) => (
                            <TouchableOpacity
                                key={m.id}
                                style={[
                                    styles.modeCard,
                                    {
                                        backgroundColor: theme.background,
                                        borderColor: selectedMode === m.id ? theme.primary : 'transparent',
                                        borderWidth: 2
                                    }
                                ]}
                                onPress={() => setSelectedMode(m.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.modeIconContainer, { backgroundColor: m.color + '15' }]}>
                                    <Ionicons name={m.icon} size={16} color={m.color} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.modeTitle, { color: theme.text }]}>{m.title}</Text>
                                    <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>{m.desc}</Text>
                                </View>
                                <View style={[styles.radioCircle, { borderColor: selectedMode === m.id ? theme.primary : theme.textSecondary }]}>
                                    {selectedMode === m.id && <View style={[styles.radioFill, { backgroundColor: theme.primary }]} />}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Duration Slider (Only for Exam Mode) */}
                {selectedMode === "exam" && selectedSubjects.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.card }]}>
                        <View style={styles.durationHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Exam Duration</Text>
                            <Text style={[styles.durationValue, { color: theme.primary }]}>{formatDuration(duration)}</Text>
                        </View>

                        <Slider
                            style={styles.slider}
                            minimumValue={10}
                            maximumValue={120}
                            step={1}
                            value={duration}
                            onValueChange={handleDurationChange}
                            minimumTrackTintColor={theme.primary}
                            maximumTrackTintColor={theme.border}
                            thumbTintColor={theme.primary}
                        />

                        <View style={styles.sliderLabels}>
                            <Text style={{ color: theme.textSecondary, fontFamily: 'DMSans-Regular', fontSize: 12 }}>10m</Text>
                            <Text style={{ color: theme.textSecondary, fontFamily: 'DMSans-Regular', fontSize: 12 }}>2h</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {selectedSubjects.length > 0 && (
                <View style={[styles.footer, { backgroundColor: theme.card }]}>
                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: theme.primary, opacity: loading ? 0.6 : 1 }]}
                        onPress={handleStartQuiz}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Text style={styles.startButtonText}>Start Quiz</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Subject Selection Modal */}
            <Modal
                visible={subjectModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSubjectModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Subjects</Text>
                            <TouchableOpacity onPress={() => setSubjectModalVisible(false)}>
                                <Ionicons name="close" size={28} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Search Input */}
                        <View style={[styles.searchContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Ionicons name="search" size={18} color={theme.textSecondary} />
                            <TextInput
                                style={[styles.searchInput, { color: theme.text }]}
                                placeholder="Search subjects..."
                                placeholderTextColor={theme.textSecondary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {loadingSubjects ? (
                            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                        ) : (
                            <FlatList
                                data={allSubjects.filter(subject =>
                                    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
                                )}
                                renderItem={renderSubjectItem}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={styles.subjectList}
                                showsVerticalScrollIndicator={false}
                            />
                        )}

                        <TouchableOpacity
                            style={[styles.doneButton, { backgroundColor: theme.primary }]}
                            onPress={() => setSubjectModalVisible(false)}
                        >
                            <Text style={styles.doneButtonText}>
                                Done ({selectedSubjects.length} selected)
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
        borderBottomWidth: 1,
    },
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontFamily: 'DMSans-Bold' },
    content: { padding: 16, paddingBottom: 100 },

    selectSubjectsBtn: {
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    selectSubjectsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectSubjectsTitle: {
        fontSize: 15,
        fontFamily: 'DMSans-Bold',
        marginBottom: 3,
    },
    selectSubjectsDesc: {
        fontSize: 12,
        fontFamily: 'DMSans-Regular',
    },

    section: { borderRadius: 16, padding: 12, marginBottom: 16 },
    sectionTitle: { fontSize: 15, marginBottom: 10, fontFamily: 'DMSans-Bold' },

    subjectCard: {
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
    },
    subjectHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    tagDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#6366F1' },
    subjectName: { fontSize: 14, fontFamily: 'DMSans-Bold', flex: 1 },
    removeBtn: {
        padding: 2,
    },

    configRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    configLabel: { fontSize: 12, fontFamily: 'DMSans-Medium' },

    // Custom dropdown styles
    customDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 80,
        gap: 8,
    },
    dropdownText: {
        fontSize: 13,
        fontFamily: 'DMSans-Medium',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 38,
        right: 0,
        minWidth: 100,
        maxHeight: 200,
        borderRadius: 8,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 1000,
    },
    dropdownScroll: {
        maxHeight: 200,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    dropdownItemText: {
        fontSize: 13,
        fontFamily: 'DMSans-Medium',
    },

    pickerContainer: {
        borderRadius: 10,
        borderWidth: 1,
        overflow: 'hidden',
        minWidth: 100,
        height: 44,
        justifyContent: 'center',
    },
    picker: {
        height: 44,
        width: '100%',
    },

    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    counterBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    counterInput: {
        width: 50,
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        textAlign: 'center',
        fontFamily: 'DMSans-Bold',
        fontSize: 16,
    },
    rangeHint: {
        fontSize: 11,
        fontFamily: 'DMSans-Regular',
        marginTop: 4,
    },

    modeCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderRadius: 16,
        gap: 16,
        marginBottom: 10,
    },
    modeIconContainer: { width: 30, height: 30, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    modeTitle: { fontSize: 14, fontFamily: 'DMSans-Bold', marginBottom: 4 },
    modeDesc: { fontSize: 12, lineHeight: 18, fontFamily: 'DMSans-Regular' },

    radioCircle: { width: 16, height: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    radioFill: { width: 8, height: 8, borderRadius: 6 },

    durationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    durationValue: { fontSize: 24, fontFamily: 'DMSans-Bold' },

    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },

    footer: { padding: 20, position: 'absolute', bottom: 0, left: 0, right: 0 },
    startButton: { flexDirection: 'row', gap: 10, paddingVertical: 16, borderRadius: 14, alignItems: "center", justifyContent: 'center' },
    startButtonText: { color: "#fff", fontSize: 18, fontFamily: 'DMSans-Bold' },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '65%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'DMSans-Bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'DMSans-Regular',
        padding: 0,
    },
    subjectList: {
        paddingBottom: 12,
    },
    subjectModalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 2,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    subjectModalText: {
        fontSize: 14,
        fontFamily: 'DMSans-Medium',
    },
    doneButton: {
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'DMSans-Bold',
    },
})

export default ExamConfigScreen
