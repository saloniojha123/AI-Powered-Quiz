const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Score = require('../models/Score');
const Quiz = require('../models/Quiz');
const Groq = require('groq-sdk');

// @route POST /api/score/submit
// @desc Submit score after completing a quiz
// @access Private
router.post('/submit', auth, async (req, res) => {
    try {
        const { quizId, score, totalQuestions } = req.body;

        // Validate quiz exists
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Save score
        const newScore = await Score.create({
            userId: req.user.id,
            quizId,
            score,
            totalQuestions
        });

        const percentage = Math.round((score / totalQuestions) * 100);

        res.status(201).json({
            message: 'Score submitted successfully',
            result: {
                id: newScore._id,
                score,
                totalQuestions,
                percentage,
                topicTitle: quiz.topicTitle,
                submittedAt: newScore.createdAt
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route GET /api/score/history
// @desc Get all scores for logged in user
// @access Private
router.get('/history', auth, async (req, res) => {
    try {
        const scores = await Score.find({ userId: req.user.id })
            .populate('quizId', 'topicTitle')
            .sort({ createdAt: -1 });

        const history = scores.map(s => ({
            id: s._id,
            topicTitle: s.quizId?.topicTitle || 'Unknown',
            score: s.score,
            totalQuestions: s.totalQuestions,
            percentage: Math.round((s.score / s.totalQuestions) * 100),
            date: s.createdAt
        }));

        res.json({
            total: history.length,
            history
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route GET /api/score/stats
// @desc Get user stats - average score, best topic, total quizzes
// @access Private
router.get('/stats', auth, async (req, res) => {
    try {
        const scores = await Score.find({ userId: req.user.id })
            .populate('quizId', 'topicTitle');

        if (scores.length === 0) {
            return res.json({
                totalQuizzes: 0,
                averageScore: 0,
                bestScore: 0,
                message: 'No quizzes taken yet!'
            });
        }

        const percentages = scores.map(s => Math.round((s.score / s.totalQuestions) * 100));
        const averageScore = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
        const bestScore = Math.max(...percentages);

        // Find best topic
        const topicScores = {};
        scores.forEach(s => {
            const topic = s.quizId?.topicTitle || 'Unknown';
            if (!topicScores[topic]) topicScores[topic] = [];
            topicScores[topic].push(Math.round((s.score / s.totalQuestions) * 100));
        });

        const bestTopic = Object.entries(topicScores)
            .map(([topic, scores]) => ({
                topic,
                avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            }))
            .sort((a, b) => b.avg - a.avg)[0];

        res.json({
            totalQuizzes: scores.length,
            averageScore: `${averageScore}%`,
            bestScore: `${bestScore}%`,
            bestTopic: bestTopic?.topic || 'N/A'
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/score/analyze
// @desc    AI analyzes quiz performance and identifies weak topics
// @access  Private
router.post('/analyze', auth, async (req, res) => {
    try {
        const { quizId, answers, questions } = req.body;

        if (!questions || !answers) {
            return res.status(400).json({ message: 'Missing questions or answers payload' });
        }

        if (!process.env.GROQ_API_KEY) {
            console.error("GROQ_API_KEY missing in environment variables!");
            return res.status(500).json({ message: "Server configuration error: GROQ_API_KEY missing." });
        }

        // Format quiz data for Groq
        const performance = questions.map((q, i) => ({
            question: q.questionText,
            correct: answers[i] === q.correctOptionIndex,
            userAnswer: q.options[answers[i]] || 'Skipped',
            correctAnswer: q.options[q.correctOptionIndex]
        }));

        const correctCount = performance.filter(p => p.correct).length;

        // Groq API Call
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const prompt = `You are an educational AI assistant. Analyze this student's quiz performance.
Quiz Performance:
${performance.map((p, i) => `Q${i + 1}: ${p.question} | Answered: ${p.userAnswer} | Correct: ${p.correctAnswer} | Result: ${p.correct ? 'CORRECT' : 'WRONG'}`).join('\n')}

Return strictly raw JSON format without markdown code fences:
{
  "strongTopics": ["topic1", "topic2"],
  "weakTopics": ["topic1", "topic2"],
  "recommendations": ["advice 1", "advice 2"],
  "overallFeedback": "One encouraging sentence"
}`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3
        });

        const rawContent = completion.choices[0].message.content;
        const cleanedContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();

        const analysis = JSON.parse(cleanedContent);

        res.json({
            score: correctCount,
            totalQuestions: questions.length,
            percentage: Math.round((correctCount / questions.length) * 100),
            analysis
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ message: 'Analysis failed', error: error.message });
    }
});

module.exports = router;