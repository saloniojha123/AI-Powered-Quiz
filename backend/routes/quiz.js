const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');

// Multer setup - store PDF in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper: Generate quiz from text using Groq
const generateQuizFromText = async (text, topicTitle) => {
    const prompt = `
You are a quiz generator. Based on the following study notes, generate exactly 10 multiple choice questions.

Study Notes:
${text}

Rules:
- Each question must have exactly 4 options
- Only one option is correct
- correctOptionIndex must be 0, 1, 2, or 3 (index of correct option)
- Questions should test understanding, not just memorization
- Return ONLY valid JSON, no extra text, no markdown formatting

Return this exact JSON format:
{
  "questions": [
    {
      "questionText": "Question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0
    }
  ]
}
`;

    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        response_format: { type: 'json_object' }
    });

    const response = completion.choices[0].message.content;
    const cleaned = response.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
};

// @route POST /api/quiz/generate
router.post('/generate', auth, upload.single('pdf'), async (req, res) => {
    try {
        let textContent = '';
        const topicTitle = req.body.topicTitle || 'My Quiz';

        if (req.file) {
            const pdfData = await pdfParse(req.file.buffer);
            textContent = pdfData.text;
        } else if (req.body.text) {
            textContent = req.body.text;
        } else {
            return res.status(400).json({ message: 'Please provide text or upload a PDF' });
        }

        if (textContent.trim().length < 100) {
            return res.status(400).json({ message: 'Content too short. Please provide more study notes.' });
        }

        console.log('🤖 Generating quiz with Groq...');
        const quizData = await generateQuizFromText(textContent, topicTitle);

        const quiz = await Quiz.create({
            userId: req.user.id,
            topicTitle,
            questions: quizData.questions
        });

        console.log(`✅ Quiz generated: ${quiz._id}`);

        res.status(201).json({
            message: 'Quiz generated successfully',
            quiz: {
                id: quiz._id,
                topicTitle: quiz.topicTitle,
                questions: quiz.questions,
                totalQuestions: quiz.questions.length
            }
        });

    } catch (error) {
        console.error('Quiz generation error:', error.message);
        res.status(500).json({ message: 'Failed to generate quiz', error: error.message });
    }
});

// @route GET /api/quiz/my-quizzes
router.get('/my-quizzes', auth, async (req, res) => {
    try {
        const quizzes = await Quiz.find({ userId: req.user.id })
            .select('topicTitle createdAt questions')
            .sort({ createdAt: -1 });

        res.json({
            total: quizzes.length,
            quizzes: quizzes.map(q => ({
                id: q._id,
                topicTitle: q.topicTitle,
                totalQuestions: q.questions.length,
                createdAt: q.createdAt
            }))
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route GET /api/quiz/:id
router.get('/:id', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        res.json({ quiz });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;