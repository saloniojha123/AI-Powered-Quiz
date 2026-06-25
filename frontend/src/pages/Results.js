import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Results() {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state) {
        navigate('/dashboard');
        return null;
    }

    const { score, totalQuestions, answers, quiz } = state;
    const percentage = Math.round((score / totalQuestions) * 100);

    const getEmoji = () => {
        if (percentage >= 80) return '🏆';
        if (percentage >= 60) return '👍';
        if (percentage >= 40) return '📚';
        return '💪';
    };

    const getMessage = () => {
        if (percentage >= 80) return 'Excellent work!';
        if (percentage >= 60) return 'Good job!';
        if (percentage >= 40) return 'Keep studying!';
        return 'Don\'t give up!';
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Score Summary */}
                <div style={styles.scoreCircle}>
                    <span style={styles.emoji}>{getEmoji()}</span>
                    <h2 style={styles.percentage}>{percentage}%</h2>
                    <p style={styles.message}>{getMessage()}</p>
                </div>

                <p style={styles.scoreText}>
                    You got <strong>{score}</strong> out of <strong>{totalQuestions}</strong> correct
                </p>

                {/* Answer Review */}
                <h3 style={styles.reviewTitle}>Answer Review</h3>
                <div style={styles.reviewList}>
                    {quiz.questions.map((q, i) => {
                        const isCorrect = answers[i] === q.correctOptionIndex;
                        return (
                            <div key={i} style={{ ...styles.reviewItem, borderLeft: `4px solid ${isCorrect ? '#43e97b' : '#f5576c'}` }}>
                                <p style={styles.reviewQuestion}>{i + 1}. {q.questionText}</p>
                                <p style={{ ...styles.reviewAnswer, color: isCorrect ? '#2e7d32' : '#c62828' }}>
                                    {isCorrect ? '✅' : '❌'} Your answer: {q.options[answers[i]]}
                                </p>
                                {!isCorrect && (
                                    <p style={styles.correctAnswer}>
                                        ✅ Correct: {q.options[q.correctOptionIndex]}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Buttons */}
                <div style={styles.buttons}>
                    <button style={styles.generateBtn} onClick={() => navigate('/generate')}>
                        ✨ New Quiz
                    </button>
                    <button style={styles.dashboardBtn} onClick={() => navigate('/dashboard')}>
                        📊 Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    },
    card: {
        background: 'white', borderRadius: '20px', padding: '40px',
        width: '100%', maxWidth: '600px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    },
    scoreCircle: {
        textAlign: 'center', padding: '24px',
        background: 'linear-gradient(135deg, #667eea, #f093fb)',
        borderRadius: '16px', marginBottom: '24px'
    },
    emoji: { fontSize: '48px', display: 'block', marginBottom: '8px' },
    percentage: { color: 'white', fontSize: '48px', margin: '0 0 8px', fontWeight: '800' },
    message: { color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '18px', fontWeight: '600' },
    scoreText: { textAlign: 'center', color: '#555', fontSize: '16px', marginBottom: '24px' },
    reviewTitle: { fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '16px' },
    reviewList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
    reviewItem: { padding: '12px 16px', background: '#fafafa', borderRadius: '0 10px 10px 0' },
    reviewQuestion: { margin: '0 0 6px', fontSize: '14px', fontWeight: '600', color: '#333' },
    reviewAnswer: { margin: '0 0 4px', fontSize: '13px' },
    correctAnswer: { margin: 0, fontSize: '13px', color: '#2e7d32' },
    buttons: { display: 'flex', gap: '12px' },
    generateBtn: {
        flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer'
    },
    dashboardBtn: {
        flex: 1, padding: '14px', borderRadius: '12px',
        border: '2px solid #667eea', background: 'white',
        color: '#667eea', fontSize: '15px', fontWeight: '700', cursor: 'pointer'
    }
};