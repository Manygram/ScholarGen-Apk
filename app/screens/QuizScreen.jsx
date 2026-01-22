"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Modal,
    Image,
    ActivityIndicator,
    Alert,
} from "react-native"
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import CommonHeader from "../components/CommonHeader"
import MathRender from "../components/MathRender"
import { useDatabase } from "../context/DatabaseContext";
import { authService } from "../services/authService"; // 1. IMPORT THIS

const API_BASE_URL = "https://api.scholargens.com/api";

const QuizScreen = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme()
    const { isPremium } = useAuth()
    const { getOfflineQuestions } = useDatabase();

    // 2. ADD LOCAL STATE FOR ROBUST CHECK
    const [localIsPremium, setLocalIsPremium] = useState(false);

    // 3. CHECK STORAGE DIRECTLY ON MOUNT
    useEffect(() => {
        const verifyPremium = async () => {
            try {
                const session = await authService.getSession();
                const isActive = session?.premium?.active || session?.user?.premium?.active;
                console.log(`[QuizScreen] Context: ${isPremium}, LocalStorage: ${isActive}`);

                if (isActive) {
                    setLocalIsPremium(true);
                }
            } catch (err) {
                console.log("Error checking local premium status", err);
            }
        };
        verifyPremium();
    }, []);

    // subjects = [{ subjectId: "...", year: 2020 }]
    // originalSubjects = [{ _id: "...", name: "Physics" }]
    const { subjects, originalSubjects, mode, duration } = route.params

    // Merge for UI
    const [activeSubjects, setActiveSubjects] = useState([])

    useEffect(() => {
        if (subjects && originalSubjects) {
            const merged = subjects.map((apiSub) => {
                // Fix: Check s.id instead of s._id
                const original = originalSubjects.find((s) => (s.id || s._id) == apiSub.subjectId)
                return {
                    _id: apiSub.subjectId, // Keep this as the ID used for tracking within this screen
                    name: original ? original.name : "Unknown",
                    year: apiSub.year,
                }
            })
            setActiveSubjects(merged)
        }
    }, [subjects, originalSubjects])

    const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0)
    const [questionsState, setQuestionsState] = useState({})

    // User Answers stores INDEX now: { subjectId: { questionIndex: optionIndex } }
    const [userAnswers, setUserAnswers] = useState({})

    const [subjectQuestionIndices, setSubjectQuestionIndices] = useState({})
    const [isLoading, setIsLoading] = useState(true)

    // Timers & State...
    const [timeLeft, setTimeLeft] = useState(mode === "exam" ? duration * 60 : null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [timeSpentPerSubject, setTimeSpentPerSubject] = useState({})

    // UI Modals
    const [showExplanation, setShowExplanation] = useState(false)
    const [subscribeModalVisible, setSubscribeModalVisible] = useState(false)
    const [resultModalVisible, setResultModalVisible] = useState(false)
    const [finalScore, setFinalScore] = useState(0)
    const [finalTotal, setFinalTotal] = useState(0)
    const [quizId, setQuizId] = useState(null)

    // Result Stats
    const [resultSubjectScores, setResultSubjectScores] = useState({})
    const [resultTotalQuestions, setResultTotalQuestions] = useState(0)
    const [resultCorrectAnswers, setResultCorrectAnswers] = useState(0)

    const [studyShowAnswer, setStudyShowAnswer] = useState(false)

    // "isEvaluating" now effectively means "Is Checked" in Study Mode
    const [isEvaluating, setIsEvaluating] = useState(false)

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true)
            try {
                const token = await AsyncStorage.getItem("userToken")
                const authHeader = { headers: { Authorization: `Bearer ${token}` } }

                const payload = {
                    mode: mode,
                    subjects: subjects,
                    durationInMinutes: mode === "exam" ? Number.parseInt(duration) : 0,
                }

                console.log("Starting Quiz with payload:", JSON.stringify(payload));

                let quizData = null;
                try {
                    const response = await axios.post(`${API_BASE_URL}/quiz/start`, payload, authHeader);
                    // console.log("[Quiz Debug] API Response");

                    if (response.data && (response.data.quiz || response.data._id)) {
                        quizData = response.data.quiz || response.data;
                    }
                } catch (apiError) {
                    console.log("[Quiz] Mode check - API failed, checking offline...", apiError.message);

                    // Offline Fallback Logic
                    const offlineGrouped = [];
                    let hasOfflineData = false;

                    for (const sub of subjects) {
                        const cachedQs = await getOfflineQuestions(sub.subjectId, sub.year || 2024); // Fallback year?

                        if (cachedQs && cachedQs.length > 0) {
                            const limit = mode === 'exam' ? 40 : 10;
                            const picked = cachedQs.slice(0, limit);

                            if (picked.length > 0) {
                                hasOfflineData = true;
                                offlineGrouped.push({
                                    subjectId: sub.subjectId,
                                    name: "Offline Subject",
                                    questions: picked
                                });
                            }
                        }
                    }

                    if (hasOfflineData) {
                        quizData = {
                            id: `offline_${Date.now()}`,
                            groupedQuestions: offlineGrouped
                        };
                        Toast.show({
                            type: 'info',
                            text1: 'Offline Mode',
                            text2: 'Loaded questions from local storage.'
                        });
                    } else {
                        // Re-throw if no offline data found
                        throw apiError;
                    }
                }

                if (quizData) {
                    const qId = quizData.id;
                    console.log("Quiz ID captured:", qId)
                    setQuizId(qId)

                    const groupedQuestions = quizData.groupedQuestions;

                    // CRITICAL CRASH FIX: Check if groupedQuestions exists and has data
                    if (!groupedQuestions || !Array.isArray(groupedQuestions) || groupedQuestions.length === 0) {
                        throw new Error("No questions returned from server (and no offline data).");
                    }

                    const mappedQuestions = {}
                    const initIndices = {}
                    const initAnswers = {}

                    subjects.forEach((sub) => {
                        const id = sub.subjectId
                        initIndices[id] = 0
                        initAnswers[id] = {}

                        const group = groupedQuestions.find((g) => g.subjectId == id)
                        let rawQuestions = group ? group.questions : []

                        // Check if we actually got questions for this subject
                        if (rawQuestions.length === 0) {
                            console.warn(`No questions found for subject ${id}`);
                        }

                        // PREMIUM RESTRICTION (TEMPORARILY DISABLED FOR DEBUGGING)
                        // if (!isPremium && rawQuestions.length > 5) {
                        //     rawQuestions = rawQuestions.slice(0, 5);
                        // }

                        mappedQuestions[id] = rawQuestions.map((q) => {
                            const questionId = q.id || q._id;

                            // Image Parsing
                            let parsedImages = [];
                            try {
                                if (typeof q.images === 'string') {
                                    const cleaned = q.images.trim();
                                    if (cleaned.startsWith('[') || cleaned.startsWith('{')) {
                                        try {
                                            parsedImages = JSON.parse(cleaned);
                                        } catch (innerE) {
                                            // fallback if simple parse fails
                                            parsedImages = [];
                                        }
                                    } else {
                                        parsedImages = [cleaned];
                                    }
                                } else if (Array.isArray(q.images)) {
                                    parsedImages = q.images;
                                }
                            } catch (e) {
                                console.log("Image parsing error", e);
                                parsedImages = [];
                            }

                            // Filter out garbage entries (e.g. "[" or "]") and find valid image
                            let finalImage = null;
                            if (Array.isArray(parsedImages)) {
                                // Find first element that is either a valid object with URL or a valid string URL
                                const validEntry = parsedImages.find(img => {
                                    if (typeof img === 'string') {
                                        const s = img.trim();
                                        return s.length > 5 && s !== '[' && s !== ']' && !s.includes('undefined');
                                    }
                                    if (typeof img === 'object' && img !== null) {
                                        return img.url && typeof img.url === 'string';
                                    }
                                    return false;
                                });
                                finalImage = validEntry || null;
                            } else if (typeof parsedImages === 'object' && parsedImages !== null) {
                                finalImage = parsedImages; // It was a single object
                            }

                            // Explanation Image Parsing
                            let parsedExplanationImage = null;
                            try {
                                if (typeof q.explanationImage === 'string') {
                                    if (q.explanationImage.trim().startsWith('{')) {
                                        parsedExplanationImage = JSON.parse(q.explanationImage);
                                    } else {
                                        parsedExplanationImage = q.explanationImage;
                                    }
                                } else {
                                    parsedExplanationImage = q.explanationImage;
                                }
                            } catch (e) {
                                parsedExplanationImage = null;
                            }

                            // Determine Image Position
                            let imgPosition = q.imagePosition || 'top';
                            if (parsedImages.length > 0 && typeof parsedImages[0] === 'object' && parsedImages[0].position) {
                                imgPosition = parsedImages[0].position;
                            }

                            return {
                                id: questionId,
                                _id: questionId,
                                question: q.question,
                                correctOption: q.correctOption,
                                explanation: q.explanation || "No explanation provided.",
                                questionImage: finalImage,
                                explanationImage: parsedExplanationImage || null,
                                imagePosition: imgPosition,
                                options: (() => {
                                    let opts = q.options;
                                    if (typeof opts === 'string') {
                                        try { opts = JSON.parse(opts); } catch (e) { opts = []; }
                                    }
                                    if (!Array.isArray(opts)) opts = [];
                                    return opts.map((opt) => {
                                        if (typeof opt === 'object' && opt !== null) {
                                            const isTrue = (val) => val === true || val === "true" || val === 1 || val === "1";
                                            return {
                                                text: opt.text || opt.value || '',
                                                image: opt.image || null,
                                                isCorrect: isTrue(opt.isCorrect) || isTrue(opt.correct) || isTrue(opt.answer)
                                            };
                                        }
                                        return { text: String(opt), image: null, isCorrect: false };
                                    });
                                })(),
                            };
                        })
                    })

                    setQuestionsState(mappedQuestions)
                    setSubjectQuestionIndices(initIndices)
                    setUserAnswers(initAnswers)

                    const initialTime = {}
                    subjects.forEach((s) => (initialTime[s.subjectId] = 0))
                    setTimeSpentPerSubject(initialTime)
                }
            } catch (error) {
                console.log("Quiz Start Error:", error)
                let errMsg = "Failed to connect to server.";

                if (error.response) {
                    console.log("Backend Response:", error.response.data);
                    errMsg = error.response.data?.message || "Server Error";

                    // Specific handling for "not enough questions" (400)
                    if (error.response.status === 400 && errMsg.includes("available for subject")) {
                        errMsg = "Not enough questions available for the selected configuration. Please try reducing the number of questions.";
                    }
                } else if (error.message) {
                    errMsg = error.message;
                }

                Toast.show({
                    type: 'error',
                    text1: 'Quiz Start Failed',
                    text2: errMsg,
                    visibilityTime: 4000
                });
                navigation.goBack()
            } finally {
                setIsLoading(false)
            }
        }
        fetchQuestions()
    }, [])

    // ... Timer logic
    useEffect(() => {
        if (mode === "exam" && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        handleSubmit()
                        return 0
                    }
                    return prev - 1
                })

                if (!isSubmitting && activeSubjects.length > 0) {
                    const currentSubId = activeSubjects[currentSubjectIndex]?._id
                    if (currentSubId) {
                        setTimeSpentPerSubject((prev) => ({ ...prev, [currentSubId]: (prev[currentSubId] || 0) + 1 }))
                    }
                }
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [timeLeft, mode, currentSubjectIndex, isSubmitting, activeSubjects])


    // Handlers
    const currentSubjectObj = activeSubjects[currentSubjectIndex]
    const currentSubjectId = currentSubjectObj?._id
    const currentQuestions = questionsState[currentSubjectId] || []
    const currentQIndex = subjectQuestionIndices[currentSubjectId] || 0
    const currentQuestion = currentQuestions[currentQIndex]

    // Debugging "No Questions" state
    useEffect(() => {
        if (!isLoading && !currentQuestion) {
            console.log("[QuizScreen Debug] No Current Question Found!");
        }
    }, [isLoading, currentQuestion]);

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

    const handleOptionSelect = (optionIndex) => {
        if ((showExplanation || isEvaluating) && mode !== "exam") return
        setUserAnswers((prev) => ({
            ...prev,
            [currentSubjectId]: { ...prev[currentSubjectId], [currentQIndex]: optionIndex },
        }))
    }

    const moveToNextQuestion = () => {

        // 4. FIX: Check BOTH Context AND Local Storage
        const hasPremiumAccess = isPremium || localIsPremium;

        // PREMIUM CHECK: Limit free users to 5 questions TOTAL across all subjects
        if (!hasPremiumAccess) {
            // Count total questions passed so far
            let totalPassed = 0;
            // Add completed subjects
            for (let i = 0; i < currentSubjectIndex; i++) {
                const sId = activeSubjects[i]?._id;
                if (questionsState[sId]) totalPassed += questionsState[sId].length;
            }
            // Add current subject index
            totalPassed += currentQIndex + 1;

            if (totalPassed >= 5) {
                Alert.alert(
                    "Premium Requirement",
                    "Free plan is limited to 5 questions per quiz. Upgrade to Premium for unlimited access!",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Upgrade Now", onPress: () => navigation.navigate("Activation") }
                    ]
                );
                return;
            }
        }

        if (currentQIndex < currentQuestions.length - 1) {
            setSubjectQuestionIndices((prev) => ({ ...prev, [currentSubjectId]: prev[currentSubjectId] + 1 }))
            setStudyShowAnswer(false)
            setShowExplanation(false)
            setIsEvaluating(false)
        } else if (currentSubjectIndex < activeSubjects.length - 1) {
            // Auto-advance to next subject
            setCurrentSubjectIndex((prev) => prev + 1)
            setStudyShowAnswer(false)
            setShowExplanation(false)
            setIsEvaluating(false)
            Toast.show({
                type: 'info',
                text1: 'Next Subject',
                text2: `Switched to ${activeSubjects[currentSubjectIndex + 1].name}`
            });
        } else {
            handleSubmit()
        }
    }

    const handleNext = () => {
        const isPractice = mode === "practice" || mode === "study"
        // userAnswers now stores INDEX (number)
        const selectedIndex = userAnswers[currentSubjectId]?.[currentQIndex]
        const hasSelection = selectedIndex !== undefined && selectedIndex !== null

        if (isPractice) {
            // "Check" State
            if (!isEvaluating) {
                if (!hasSelection) {
                    Toast.show({
                        type: 'info',
                        text1: 'Select an Option',
                        text2: 'Please select an answer to check.'
                    });
                    return
                }
                // Show Feedback (Green/Red & Explanation)
                setIsEvaluating(true)
                setStudyShowAnswer(true)
                setShowExplanation(true)
                return
            }

            // "Next" State (Already Checked)
            if (isEvaluating) {
                moveToNextQuestion()
                return
            }
        }

        // Exam mode: Move immediately
        moveToNextQuestion()
    }

    const handlePrev = () => {
        if (currentQIndex > 0) {
            setSubjectQuestionIndices((prev) => ({ ...prev, [currentSubjectId]: prev[currentSubjectId] - 1 }))
            setStudyShowAnswer(false)
            setShowExplanation(false)
            setIsEvaluating(false)
        }
    }

    const handleSubmit = async () => {
        if (isSubmitting) return
        setIsSubmitting(true)
        setIsEvaluating(false)

        try {
            const token = await AsyncStorage.getItem("userToken")
            const authHeader = { headers: { Authorization: `Bearer ${token}` } }

            // Construct answers map: { questionId: selectedOptionText }
            const formattedAnswers = {}
            let totalScore = 0
            let totalPossible = 0
            const subjectScores = {}

            activeSubjects.forEach(sub => {
                const subId = sub._id
                const questions = questionsState[subId] || []
                const answersIndices = userAnswers[subId] || {}

                let subCorrect = 0

                questions.forEach((q, idx) => {
                    const selectedIdx = answersIndices[idx]
                    const questionId = q.id || q._id;

                    let selectedText = null;
                    if (selectedIdx !== undefined && q.options[selectedIdx]) {
                        selectedText = q.options[selectedIdx].text;
                        if (questionId) {
                            formattedAnswers[questionId] = selectedText
                        }
                    }

                    // STRICT CORRECTNESS CHECK
                    // We now rely on Backend to provide 'a', 'b', 'c', 'd' as correctOption
                    let isCorrect = false;

                    if (selectedIdx !== undefined && q.options[selectedIdx]) {
                        // Current Option Key (a, b, c, d...)
                        const selectedKey = String.fromCharCode(97 + selectedIdx); // 0->a, 1->b
                        const correctKey = String(q.correctOption || '').trim().toLowerCase();

                        // 1. Check strict isCorrect flag on option object (if exists)
                        if (q.options[selectedIdx].isCorrect === true) {
                            isCorrect = true;
                        }
                        // 2. Strict Key Match
                        else if (selectedKey === correctKey) {
                            isCorrect = true;
                        }
                    }

                    if (isCorrect) subCorrect++;
                })

                // Calculate score / 100 per subject (JAMB Style)
                const subjectScore = questions.length > 0 ? Math.round((subCorrect / questions.length) * 100) : 0;

                subjectScores[sub.name] = subjectScore; // Store raw score (0-100)
                totalScore += subCorrect; // Total correct answers count
                totalPossible += questions.length;
            })

            // JAMB Style Total
            const totalSum = Object.values(subjectScores).reduce((a, b) => a + b, 0);
            const maxPossibleScore = activeSubjects.length * 100;

            setFinalScore(totalSum);
            setFinalTotal(maxPossibleScore);

            // Set detailed stats
            setResultSubjectScores(subjectScores)
            setResultTotalQuestions(totalPossible)
            setResultCorrectAnswers(totalScore)

            const payload = {
                answers: formattedAnswers,
                timeSpentPerSubject: timeSpentPerSubject
            }

            if (!quizId) {
                console.error("No Quiz ID found. Cannot submit.")
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Quiz ID missing. Cannot submit results.'
                });
                setIsSubmitting(false)
                return
            }

            console.log(`Submitting quiz ${quizId}...`, payload)

            const response = await axios.post(`${API_BASE_URL}/quiz/${quizId}/submit`, payload, authHeader)

            // You might want to pass the result data to the modal or navigation
            setResultModalVisible(true)

        } catch (error) {
            console.error("Quiz Submit Error:", error)
            const errMsg = error.response?.data?.message || error.message || 'Unknown error'
            Toast.show({
                type: 'error',
                text1: 'Submission Failed',
                text2: `Could not submit quiz results. ${errMsg}`
            });
            setIsSubmitting(false)
        }
    }

    const getOptionStyle = (option, index) => {
        const selectedIndex = userAnswers[currentSubjectId]?.[currentQIndex];
        const isSelected = selectedIndex === index;

        const isStudy = mode === "study" || mode === "practice";

        // CHECK CORRECTNESS for this specific option
        let isActuallyCorrect = option.isCorrect === true;

        if (!isActuallyCorrect && currentQuestion?.correctOption) {
            const myKey = String.fromCharCode(97 + index); // 0->a, 1->b
            const correctKey = String(currentQuestion.correctOption || '').trim().toLowerCase();

            // Strict Key Match Only
            if (myKey === correctKey) {
                isActuallyCorrect = true;
            }
        }

        // Visual Logic
        // In checked state: 
        // - Highlight CORRECT answer in GREEN (whether selected or not)
        // - Highlight WRONG SELECTED answer in RED
        if (isStudy && (isEvaluating || studyShowAnswer)) {
            if (isActuallyCorrect) return { borderColor: "#4CAF50", backgroundColor: "rgba(76, 175, 80, 0.1)" }
            if (isSelected && !isActuallyCorrect) return { borderColor: "#F44336", backgroundColor: "rgba(244, 67, 54, 0.1)" }
        }

        return {
            borderColor: isSelected ? theme.primary : theme.border,
            backgroundColor: isSelected ? "rgba(255, 193, 7, 0.05)" : "transparent",
        }
    }

    const renderCircularProgress = (value, total, label, color) => (
        <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.textSecondary }}>{label}</Text>
            <Text style={{ color: theme.text, fontWeight: "bold", fontSize: 16 }}>{value}</Text>
        </View>
    )

    if (isLoading) return <ActivityIndicator size="large" style={{ flex: 1 }} color={theme.primary} />
    if (!currentQuestion)
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="alert-circle-outline" size={64} color={theme.textSecondary} />
                <Text style={{ color: theme.text, fontSize: 18, marginTop: 20, fontFamily: 'DMSans-Bold' }}>No Questions Available</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 14, marginTop: 10, textAlign: 'center', paddingHorizontal: 40 }}>
                    We couldn't load any questions for this subject/year combination.
                </Text>
                <TouchableOpacity
                    style={{ marginTop: 30, backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 }}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={{ color: '#fff', fontFamily: 'DMSans-Bold' }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )

    const getImageUrl = (img) => {
        if (!img) return null;
        let url = typeof img === 'string' ? img : img.url;

        if (!url) return null;

        // Clean up
        url = url.trim();

        // Handle relative paths (e.g. /uploads/...)
        if (url.startsWith('/')) {
            // API_BASE_URL is https://api.scholargens.com/api
            // We need root: https://api.scholargens.com
            const rootBase = "https://api.scholargens.com";
            url = `${rootBase}${url}`;
        } else if (!url.startsWith('http')) {
            // Assume it implies https:// if no protocol
            // Or if it's just a filename coming from uploads?
            // Safest fallback if it looks like a domain:
            if (url.includes('cloudinary') || url.includes('www')) {
                url = `https://${url}`;
            } else {
                // Assume relative to root
                const rootBase = "https://api.scholargens.com";
                url = `${rootBase}/${url}`;
            }
        }

        // HTTPS upgrade REMOVED to support HTTP images. 
        // Ensure "usesCleartextTraffic" is true in AndroidManifest.xml

        return url;
    }

    const mainImageUrl = getImageUrl(currentQuestion.questionImage);
    const explanationImageUrl = getImageUrl(currentQuestion.explanationImage);
    const imagePos = currentQuestion.imagePosition || 'top';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <CommonHeader
                showBack={true}
                onBack={() => navigation.goBack()}
                rightComponent={
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.timerContainer}>
                            {mode === "exam" && (
                                <View style={styles.timerChip}>
                                    <Ionicons name="time-outline" size={16} color={theme.primary} />
                                    <Text style={[styles.timerText, { color: theme.primary }]}>{formatTime(timeLeft)}</Text>
                                </View>
                            )}
                            <Text style={[styles.modeBadge, { color: theme.textSecondary }]}>{mode.toUpperCase()}</Text>
                        </View>

                        <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <View style={[styles.tabsContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {activeSubjects.map((sub, index) => (
                        <TouchableOpacity
                            key={sub._id}
                            style={[
                                styles.tab,
                                currentSubjectIndex === index && { borderBottomWidth: 2, borderColor: theme.primary },
                            ]}
                            onPress={() => setCurrentSubjectIndex(index)}
                        >
                            <Text style={{ color: currentSubjectIndex === index ? theme.primary : theme.text }}>{sub.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.questionHeader}>
                    <Text style={[styles.questionNumber, { color: theme.primary }]}>Question {currentQIndex + 1}</Text>
                    <Text style={[styles.subjectIndicator, { color: theme.textSecondary }]}>
                        {currentSubjectObj?.name} • {currentSubjectObj?.year}
                    </Text>
                </View>

                {/* Question Image TOP */}
                {mainImageUrl && (imagePos === 'top' || imagePos === 'above') && (
                    <View style={{ marginBottom: 20 }}>
                        <Image
                            source={{ uri: mainImageUrl }}
                            style={styles.questionImage}
                            resizeMode="contain"
                            onError={(e) => console.log("Image Load Error (Top):", e.nativeEvent.error)}
                        />
                    </View>
                )}

                {/* Question Text with MathRender */}
                <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                    <MathRender
                        content={currentQuestion.question}
                        style={{}}
                        textColor={theme.text}
                        fontSize={18}
                    />
                </View>

                {/* Question Image BOTTOM or MIDDLE */}
                {mainImageUrl && (imagePos === 'bottom' || imagePos === 'below') && (
                    <View style={{ marginBottom: 20 }}>
                        <Image
                            source={{ uri: mainImageUrl }}
                            style={styles.questionImage}
                            resizeMode="contain"
                            onError={(e) => console.log("Image Load Error (Bottom):", e.nativeEvent.error)}
                        />
                    </View>
                )}

                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((opt, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.optionButton, getOptionStyle(opt, idx)]}
                            onPress={() => handleOptionSelect(idx)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.optionLabel,
                                    {
                                        backgroundColor: theme.background,
                                        borderColor: userAnswers[currentSubjectId]?.[currentQIndex] === idx ? theme.primary : theme.border,
                                        borderWidth: userAnswers[currentSubjectId]?.[currentQIndex] === idx ? 2 : 1,
                                    },
                                ]}
                            >
                                <Text
                                    style={{
                                        fontWeight: "bold",
                                        color: userAnswers[currentSubjectId]?.[currentQIndex] === idx ? theme.primary : theme.textSecondary,
                                        fontSize: 14
                                    }}
                                >
                                    {String.fromCharCode(65 + idx)}
                                </Text>
                            </View>

                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                {/* Option Text with MathRender */}
                                {opt.text ? (
                                    <MathRender
                                        content={opt.text}
                                        style={{}}
                                        textColor={theme.text}
                                        fontSize={16}
                                    />
                                ) : null}

                                {getImageUrl(opt.image) && (
                                    <Image source={{ uri: getImageUrl(opt.image) }} style={styles.optionImage} resizeMode="contain" />
                                )}
                            </View>

                            {mode === "study" && (isEvaluating || studyShowAnswer) && (opt.isCorrect || currentQuestion?.correctOption === opt.text) && (
                                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                            )}
                            {mode === "study" &&
                                (isEvaluating || studyShowAnswer) &&
                                userAnswers[currentSubjectId]?.[currentQIndex] === idx &&
                                !(opt.isCorrect || currentQuestion?.correctOption === opt.text) && (
                                    <Ionicons name="close-circle" size={24} color="#F44336" />
                                )}
                        </TouchableOpacity>
                    ))}
                </View>

                {mode === "study" && (
                    <TouchableOpacity
                        style={[styles.explanationToggle, { borderColor: theme.primary, backgroundColor: studyShowAnswer ? theme.primary : 'transparent' }]}
                        onPress={() => {
                            setStudyShowAnswer(!studyShowAnswer);
                        }}
                    >
                        <Text style={{ color: studyShowAnswer ? '#fff' : theme.primary, fontWeight: "bold" }}>
                            {studyShowAnswer ? "Hide Answer & Explanation" : "Show Answer & Explanation"}
                        </Text>
                    </TouchableOpacity>
                )}

                {(studyShowAnswer || (mode === "practice" && showExplanation)) && (
                    <View style={[styles.explanationCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.explanationHeader}>
                            <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
                            <Text style={[styles.explanationTitle, { color: theme.text }]}>Explanation</Text>
                        </View>
                        <View style={{ padding: 8 }}>
                            <MathRender
                                content={currentQuestion.explanation || "No detailed explanation provided."}
                                textColor={theme.textSecondary}
                                fontSize={14}
                            />
                        </View>
                        {explanationImageUrl && (
                            <Image source={{ uri: explanationImageUrl }} style={styles.explanationImage} resizeMode="contain" />
                        )}
                    </View>
                )}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                <TouchableOpacity
                    onPress={handlePrev}
                    disabled={currentQIndex === 0}
                    style={{
                        paddingVertical: 12,
                        paddingHorizontal: 25,
                        borderRadius: 30,
                        backgroundColor: currentQIndex === 0 ? theme.border : theme.card,
                        borderWidth: 1,
                        borderColor: currentQIndex === 0 ? 'transparent' : theme.textSecondary,
                        opacity: currentQIndex === 0 ? 0.5 : 1
                    }}
                >
                    <Text style={{ color: currentQIndex === 0 ? theme.textSecondary : theme.text, fontFamily: 'DMSans-Bold', fontSize: 16 }}>Prev</Text>
                </TouchableOpacity>

                <Text style={{ color: theme.text, fontFamily: 'DMSans-Medium', fontSize: 16 }}>
                    {currentQIndex + 1} / {currentQuestions.length}
                </Text>

                <TouchableOpacity
                    onPress={handleNext}
                    style={{
                        paddingVertical: 12,
                        paddingHorizontal: 25,
                        borderRadius: 30,
                        backgroundColor: theme.primary,
                        shadowColor: theme.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 5,
                        elevation: 6
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: "bold", fontFamily: 'DMSans-Bold', fontSize: 16 }}>
                        {(mode === 'study' || mode === 'practice') ? (isEvaluating ? "Next" : "Check") : "Next"}
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal visible={resultModalVisible} animationType="slide">
                <View style={{ flex: 1, backgroundColor: theme.background }}>
                    <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

                    {/* Header Area */}
                    <View style={{ backgroundColor: theme.primary, padding: 20, paddingTop: 60, alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 30 }}>
                        <Text style={{ color: '#fff', fontSize: 24, fontFamily: 'DMSans-Bold' }}>Quiz Completed!</Text>
                        <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center', marginVertical: 20, elevation: 5 }}>
                            <Text style={{ fontSize: 48, color: theme.primary, fontFamily: 'DMSans-Bold' }}>{finalScore}</Text>
                            <Text style={{ fontSize: 14, color: theme.textSecondary, fontFamily: 'DMSans-Medium' }}>Total Score</Text>
                            <Text style={{ fontSize: 12, color: theme.textSecondary, opacity: 0.7 }}>/ {finalTotal}</Text>
                        </View>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, fontFamily: 'DMSans-Medium' }}>
                            {(finalScore / finalTotal) * 100 >= 70 ? "Excellent Work!" : (finalScore / finalTotal) * 100 >= 50 ? "Good Job!" : "Keep Practicing!"}
                        </Text>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        {/* Stats Grid */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 }}>
                            <View style={[styles.metricCard, { backgroundColor: theme.card, width: '31%', padding: 15 }]}>
                                <Ionicons name="help-circle" size={24} color={theme.primary} style={{ marginBottom: 5 }} />
                                <Text style={{ fontSize: 20, fontFamily: 'DMSans-Bold', color: theme.text }}>{resultTotalQuestions}</Text>
                                <Text style={{ fontSize: 12, color: theme.textSecondary }}>Questions</Text>
                            </View>
                            <View style={[styles.metricCard, { backgroundColor: theme.card, width: '31%', padding: 15 }]}>
                                <Ionicons name="checkmark-circle" size={24} color="#10B981" style={{ marginBottom: 5 }} />
                                <Text style={{ fontSize: 20, fontFamily: 'DMSans-Bold', color: theme.text }}>{resultCorrectAnswers}</Text>
                                <Text style={{ fontSize: 12, color: theme.textSecondary }}>Correct</Text>
                            </View>
                            <View style={[styles.metricCard, { backgroundColor: theme.card, width: '31%', padding: 15 }]}>
                                <Ionicons name="close-circle" size={24} color="#EF4444" style={{ marginBottom: 5 }} />
                                <Text style={{ fontSize: 20, fontFamily: 'DMSans-Bold', color: theme.text }}>{resultTotalQuestions - resultCorrectAnswers}</Text>
                                <Text style={{ fontSize: 12, color: theme.textSecondary }}>Wrong</Text>
                            </View>
                        </View>

                        <Text style={{ fontSize: 18, color: theme.text, marginBottom: 15, fontFamily: 'DMSans-Bold' }}>Subject Breakdown</Text>
                        {/* Subject List */}
                        {Object.keys(resultSubjectScores).map((subjectName, index) => (
                            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: theme.card, borderRadius: 16, marginBottom: 12 }}>
                                <Text style={{ fontSize: 16, color: theme.text, flex: 1, fontFamily: 'DMSans-Medium' }}>{subjectName}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ height: 6, width: 80, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden', marginRight: 12 }}>
                                        <View style={{ height: '100%', width: `${resultSubjectScores[subjectName]}%`, backgroundColor: resultSubjectScores[subjectName] >= 50 ? '#10B981' : '#EF4444' }} />
                                    </View>
                                    <Text style={{ fontFamily: 'DMSans-Bold', color: theme.text, minWidth: 40, textAlign: 'right' }}>{resultSubjectScores[subjectName]}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={{ padding: 20, paddingBottom: 30, backgroundColor: theme.background }}>
                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.card, paddingVertical: 16, width: '100%', borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: theme.primary }]}
                            onPress={() => {
                                // Prepare Corrections Data
                                const corrections = [];
                                activeSubjects.forEach(sub => {
                                    const subId = sub._id;
                                    const questions = questionsState[subId] || [];
                                    const answersIndices = userAnswers[subId] || {};

                                    questions.forEach((q, idx) => {
                                        const selectedIdx = answersIndices[idx];
                                        let selectedText = null;
                                        if (selectedIdx !== undefined && q.options[selectedIdx]) {
                                            selectedText = q.options[selectedIdx].text;
                                        }

                                        corrections.push({
                                            question: q.question,
                                            questionImage: q.questionImage,
                                            explanationImage: q.explanationImage,
                                            imagePosition: q.imagePosition,
                                            options: q.options,
                                            correctOption: q.correctOption,
                                            userSelected: selectedText,
                                            explanation: q.explanation,
                                        });
                                    });
                                });

                                setResultModalVisible(false);
                                navigation.navigate('QuizCorrection', {
                                    correctionsData: corrections,
                                    finalScore: finalScore
                                });
                            }}
                        >
                            <Text style={{ color: theme.primary, fontSize: 18, fontFamily: 'DMSans-Bold', textAlign: 'center' }}>View Corrections</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.primary, paddingVertical: 16, width: '100%', borderRadius: 16 }]}
                            onPress={() => {
                                setResultModalVisible(false)
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'MainTabs' }],
                                })
                            }}
                        >
                            <Text style={{ color: "#fff", fontSize: 18, fontFamily: 'DMSans-Bold', textAlign: 'center' }}>Return Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    timerContainer: { alignItems: "center" },
    timerChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 193, 7, 0.1)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 2,
    },
    timerText: { fontSize: 14, fontWeight: "bold", marginLeft: 4 },
    modeBadge: { fontSize: 10, fontWeight: "bold", letterSpacing: 1 },
    submitButton: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
    submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

    tabsContainer: { height: 45, borderBottomWidth: 1 },
    tab: { paddingHorizontal: 16, justifyContent: "center", height: "100%" },

    content: { flex: 1 },
    questionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    questionNumber: { fontSize: 14, fontWeight: "bold" },
    subjectIndicator: { fontSize: 12 },
    questionText: { fontSize: 18, fontWeight: "600", paddingHorizontal: 20, lineHeight: 26, marginBottom: 20 },
    questionImage: { width: "90%", height: 180, alignSelf: "center", marginBottom: 20, borderRadius: 8 },

    optionsContainer: { paddingHorizontal: 20 },
    optionButton: {
        flexDirection: "row",
        padding: 12,
        borderWidth: 1.5,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: "center",
    },
    optionLabel: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    optionText: { fontSize: 16, flex: 1 },
    optionImage: { width: "100%", height: 100, marginTop: 5, borderRadius: 4 },

    explanationToggle: { margin: 20, padding: 12, borderWidth: 1, borderRadius: 10, alignItems: "center" },
    explanationCard: { margin: 20, padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 0 },
    explanationHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    explanationTitle: { fontSize: 16, fontWeight: "bold", marginLeft: 8 },
    explanationText: { fontSize: 14, lineHeight: 22 },
    explanationImage: { width: "100%", height: 150, marginTop: 12, borderRadius: 8 },

    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 15,
        borderTopWidth: 1,
        paddingBottom: 25,
    },
    metricCard: { padding: 20, borderRadius: 16, alignItems: "center", width: "45%" },
})

export default QuizScreen