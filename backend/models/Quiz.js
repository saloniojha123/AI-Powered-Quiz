const mongoose = require('mongoose');
const QuizSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topicTitle: {
        type: String,
        required: true
    },
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    questions: [
        {
            questionText: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctOptionIndex: { type: Number, required: true },
            explanation: { type: String, default: '' }
        }
    ]
}, { timestamps: true });
module.exports = mongoose.model('Quiz', QuizSchema);