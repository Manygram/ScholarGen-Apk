export const EXAM_CATEGORIES = [
    { id: 'UTME', title: 'UTME (JAMB)', description: 'Unified Tertiary Matriculation Examination' },
];

export const SUBJECTS_DATA = {
    UTME: [
        'Mathematics', 'English', 'Accounting', 'Agriculture', 'Biology', 'Chemistry', 'Physics',
        'Arabic', 'Commerce', 'Computer Studies', 'CRK', 'Economics', 'French', 'Geography',
        'Fine Art', 'Government', 'Hausa', 'History', 'Home Economics', 'Igbo', 'IRK', 'PHE',
        'Yoruba', 'Literature in English', 'Literature Textbooks', 'Music', 'The Lekki Headmaster'
    ]
};

export const generateDemoQuestions = (subject, category) => {
    return [
        {
            id: `${category}_${subject}_1`.replace(/\s+/g, '_'),
            subject: subject,
            category: category,
            questionText: `This is a demo question 1 for ${subject} (${category}). What is the correct answer?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A',
            explanation: 'This is the explanation for question 1.'
        },
        {
            id: `${category}_${subject}_2`.replace(/\s+/g, '_'),
            subject: subject,
            category: category,
            questionText: `This is a demo question 2 for ${subject} (${category}). Calculate the value of X.`,
            options: ['10', '20', '30', '40'],
            correctAnswer: '20',
            explanation: 'This is the explanation for question 2.'
        },
        {
            id: `${category}_${subject}_3`.replace(/\s+/g, '_'),
            subject: subject,
            category: category,
            questionText: `This is a demo question 3 for ${subject} (${category}). Which of the following is true?`,
            options: ['Statement 1', 'Statement 2', 'Statement 3', 'Statement 4'],
            correctAnswer: 'Statement 3',
            explanation: 'This is the explanation for question 3.'
        }
    ];
};
