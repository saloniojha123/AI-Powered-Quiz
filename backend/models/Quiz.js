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
    questions: [
        {
            questionText: { type: String, required: true },
            options: [{ type: String, required: true }], 
            correctOptionIndex: { type: Number, required: true } 
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);