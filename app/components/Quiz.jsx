import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Sample quiz questions
const quizQuestions = [
  {
    id: 1,
    question: 'What is the capital of Nigeria?',
    options: ['Lagos', 'Abuja', 'Kano', 'Port Harcourt'],
    correctAnswer: 'Abuja'
  },
  {
    id: 2,
    question: 'Which of these is NOT a programming language?',
    options: ['Java', 'Python', 'Microsoft', 'JavaScript'],
    correctAnswer: 'Microsoft'
  },
  {
    id: 3,
    question: 'What is the largest planet in our solar system?',
    options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 'Jupiter'
  },
  {
    id: 4,
    question: 'Which of these is a prime number?',
    options: ['4', '9', '15', '17'],
    correctAnswer: '17'
  },
  {
    id: 5,
    question: 'Who wrote "Things Fall Apart"?',
    options: ['Wole Soyinka', 'Chinua Achebe', 'Chimamanda Adichie', 'Ben Okri'],
    correctAnswer: 'Chinua Achebe'
  },
  {
    id: 6,
    question: 'What is the chemical symbol for water?',
    options: ['H2O', 'CO2', 'NaCl', 'O2'],
    correctAnswer: 'H2O'
  },
  {
    id: 7,
    question: 'Which country has the largest population in Africa?',
    options: ['Nigeria', 'Egypt', 'Ethiopia', 'South Africa'],
    correctAnswer: 'Nigeria'
  },
  {
    id: 8,
    question: 'What is the main function of the mitochondria in a cell?',
    options: ['Protein synthesis', 'Energy production', 'Cell division', 'Waste removal'],
    correctAnswer: 'Energy production'
  },
  {
    id: 9,
    question: 'Which of these is NOT a type of triangle?',
    options: ['Isosceles', 'Equilateral', 'Rectangular', 'Scalene'],
    correctAnswer: 'Rectangular'
  },
  {
    id: 10,
    question: 'Who is known as the father of modern physics?',
    options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Nikola Tesla'],
    correctAnswer: 'Albert Einstein'
  }
];

const Quiz = ({ onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Initialize quiz with randomized questions
  useEffect(() => {
    // Shuffle questions and take all 10 questions
    const shuffledQuestions = [...quizQuestions].sort(() => 0.5 - Math.random());
    setQuestions(shuffledQuestions.slice(0, 10));
  }, []);

  const handleOptionSelect = (option) => {
    if (showAnswer) return; // Prevent selecting after answer is shown

    setSelectedOption(option);
    setShowAnswer(true);

    const currentQuestion = questions[currentQuestionIndex];
    if (option === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setShowAnswer(false);
      } else {
        setQuizCompleted(true);
        if (onComplete) {
          onComplete(score, questions.length);
        }
      }
    }, 1500); // 1.5 seconds delay
  };

  const getOptionStyle = (option) => {
    if (!showAnswer) return styles.option;

    const currentQuestion = questions[currentQuestionIndex];

    if (option === currentQuestion.correctAnswer) {
      return [styles.option, styles.correctOption];
    }

    if (option === selectedOption && option !== currentQuestion.correctAnswer) {
      return [styles.option, styles.wrongOption];
    }

    return styles.option;
  };

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (quizCompleted) {
    // Calculate percentage score
    const percentage = Math.round((score / questions.length) * 100);
    // Determine performance message based on percentage
    let performanceMessage = '';
    if (percentage >= 80) {
      performanceMessage = 'Excellent! You did great!';
    } else if (percentage >= 60) {
      performanceMessage = 'Good job! Keep practicing!';
    } else if (percentage >= 40) {
      performanceMessage = 'Not bad! Try again to improve!';
    } else {
      performanceMessage = 'Keep studying! You can do better!';
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.completedTitle}>Quiz Completed!</Text>

          <View style={styles.scoreCircle}>
            <Text style={styles.percentageText}>
              {percentage}%
            </Text>
          </View>

          <Text style={styles.scoreText}>
            Your Score: {score} out of {questions.length}
          </Text>

          <Text style={styles.performanceText}>
            {performanceMessage}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.quizCard}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${(currentQuestionIndex / questions.length) * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>

        <ScrollView style={styles.questionContainer}>
          <Text style={styles.questionNumber}>Question {currentQuestionIndex + 1}</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={getOptionStyle(option)}
              onPress={() => handleOptionSelect(option)}
              disabled={showAnswer}
            >
              <Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Define theme colors
const THEME = {
  primary: '#FFA000', // Amber
  secondary: '#FFF8E1', // Light Amber background
  accent: '#FF6F00', // Darker Amber for accents
  text: '#333333', // Dark text for readability
  success: '#4CAF50', // Green for correct answers
  error: '#F44336', // Red for wrong answers
  white: '#FFFFFF', // White
  lightGray: '#F5F5F5', // Light gray for backgrounds
  gray: '#9E9E9E', // Gray for secondary text
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.secondary,
    padding: 16,
    justifyContent: 'center',
  },
  quizCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    flex: 1,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.gray,
    textAlign: 'right',
  },
  questionContainer: {
    flex: 1,
  },
  questionNumber: {
    fontSize: 16,
    color: THEME.primary,
    fontWeight: '700',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: THEME.text,
    lineHeight: 30,
  },
  option: {
    backgroundColor: THEME.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  correctOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: THEME.success,
  },
  wrongOption: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: THEME.error,
  },
  optionLetter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.secondary,
    textAlign: 'center',
    lineHeight: 30,
    marginRight: 12,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  optionText: {
    fontSize: 16,
    color: THEME.text,
    flex: 1,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    color: THEME.primary,
  },
  resultCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: THEME.primary,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: THEME.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 8,
    borderColor: THEME.primary,
  },
  scoreText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
    color: THEME.text,
  },
  percentageText: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    color: THEME.primary,
  },
  performanceText: {
    fontSize: 18,
    textAlign: 'center',
    color: THEME.accent,
    fontWeight: '600',
  },
});

export default Quiz;