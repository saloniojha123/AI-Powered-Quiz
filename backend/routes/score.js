const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Score = require('../models/Score');
const Quiz = require('../models/Quiz');

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
            bestTopic: bestTopic.topic
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;