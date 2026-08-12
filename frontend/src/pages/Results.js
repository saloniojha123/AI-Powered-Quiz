

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api';

export default function Results() {
    const { state } = useLocation();
    const navigate = useNavigate();

    // 1. Declare state variables at the top level
    const [analysis, setAnalysis] = useState(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(true);
    const [copied, setCopied] = useState(false);

    // Safely extract quiz data
    const { score, totalQuestions, answers, quiz } = state || {};
    const percentage = Math.round(((score || 0) / (totalQuestions || 1)) * 100);

    // 2. Hook is ALWAYS called at the top level on every render
    useEffect(() => {
        // Guard clause inside the hook rather than an early return above it
        if (!state || !quiz || !answers) {
            setLoadingAnalysis(false);
            return;
        }

        const fetchAnalysis = async () => {
            try {
                const res = await API.post('/score/analyze', {
                    quizId: quiz.id,
                    answers,
                    questions: quiz.questions
                });
                setAnalysis(res.data.analysis);
            } catch (err) {
                console.error('Analysis request error:', err);
            } finally {
                setLoadingAnalysis(false);
            }
        };

        fetchAnalysis();
    }, [state, quiz, answers]);

    // 3. Navigation fallback placed AFTER hook declarations
    if (!state) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2 style={{ color: '#e2e8f0', textAlign: 'center' }}>No quiz session found!</h2>
                    <button style={styles.dashboardBtn} onClick={() => navigate('/dashboard')}>
                        📊 Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

        const handleShare = () => {
        const shareUrl = `${window.location.origin}/take-shared/${quiz.id}`;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };
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
        return "Don't give up!";
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Score Summary */}
                <div style={styles.scoreCircle}>
                    <span style={styles.emoji}>{getEmoji()}</span>
                    <h2 style={styles.percentage}>{percentage}%</h2>
                    <p style={styles.message}>{getMessage()}</p>
                    <p style={styles.scoreText}>
                        {score} out of {totalQuestions} correct
                    </p>
                </div>

                {/* AI Learning Report */}
                <div style={styles.reportSection}>
                    <h3 style={styles.reportTitle}>📊 Your Learning Report</h3>

                    {loadingAnalysis ? (
                        <div style={styles.loadingBox}>
                            <p style={styles.loadingText}>
                                🤖 AI is analyzing your performance...
                            </p>
                            <div style={styles.loadingBar}>
                                <div style={styles.loadingFill} />
                            </div>
                        </div>
                    ) : analysis ? (
                        <>
                            {/* Overall Feedback */}
                            <div style={styles.feedbackBox}>
                                <p style={styles.feedbackText}>
                                    💬 {analysis.overallFeedback}
                                </p>
                            </div>

                            {/* Strong Topics */}
                            {analysis.strongTopics?.length > 0 && (
                                <div style={styles.topicSection}>
                                    <h4 style={styles.topicTitle}>
                                        ✅ Strong Topics
                                    </h4>
                                    <div style={styles.tagContainer}>
                                        {analysis.strongTopics.map((topic, i) => (
                                            <span key={i} style={styles.strongTag}>
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Weak Topics */}
                            {analysis.weakTopics?.length > 0 && (
                                <div style={styles.topicSection}>
                                    <h4 style={styles.topicTitle}>
                                        ⚠️ Needs More Practice
                                    </h4>
                                    <div style={styles.tagContainer}>
                                        {analysis.weakTopics.map((topic, i) => (
                                            <span key={i} style={styles.weakTag}>
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            {analysis.recommendations?.length > 0 && (
                                <div style={styles.topicSection}>
                                    <h4 style={styles.topicTitle}>
                                        📚 Study Recommendations
                                    </h4>
                                    <div style={styles.recommendList}>
                                        {analysis.recommendations.map((rec, i) => (
                                            <div key={i} style={styles.recommendItem}>
                                                <span style={styles.recommendNum}>
                                                    {i + 1}
                                                </span>
                                                <p style={styles.recommendText}>
                                                    {rec}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p style={styles.errorText}>
                            Could not generate analysis. Try again later.
                        </p>
                    )}
                </div>

                {/* Answer Review */}
                <h3 style={styles.reviewTitle}>Answer Review</h3>
                <div style={styles.reviewList}>
                    {quiz?.questions?.map((q, i) => {
                        const isCorrect = answers[i] === q.correctOptionIndex;
                        return (
                            <div
                                key={i}
                                style={{
                                    ...styles.reviewItem,
                                    borderLeft: '4px solid ' + (isCorrect ? '#4ade80' : '#f87171')
                                }}
                            >
                                <p style={styles.reviewQuestion}>
                                    {i + 1}. {q.questionText}
                                </p>
                                <p
                                    style={{
                                        ...styles.reviewAnswer,
                                        color: isCorrect ? '#4ade80' : '#f87171'
                                    }}
                                >
                                    {isCorrect ? '✅' : '❌'} Your answer: {q.options[answers[i]] || 'Skipped'}
                                </p>
                                {!isCorrect && (
                                    <p style={styles.correctAnswer}>
                                        ✅ Correct: {q.options[q.correctOptionIndex]}
                                    </p>
                                )}
                                {q.explanation && (
                                    <p style={styles.explanation}>
                                        💡 {q.explanation}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>


                 {/* Share Button */}
                <button
                    style={{
                        ...styles.shareBtn,
                        background: copied ? '#052e16' : '#0d0d1a',
                        border: copied ? '1px solid #16a34a' : '1px solid #7c3aed',
                        color: copied ? '#4ade80' : '#a78bfa'
                    }}
                    onClick={handleShare}
                >
                    {copied ? '✅ Link Copied!' : '🔗 Share Quiz with Friends'}
                </button>


                {/* Navigation Buttons */}
                <div style={styles.buttons}>
                    <button
                        style={styles.generateBtn}
                        onClick={() => navigate('/generate')}
                    >
                        ✨ New Quiz
                    </button>
                    <button
                        style={styles.dashboardBtn}
                        onClick={() => navigate('/dashboard')}
                    >
                        📊 Dashboard
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes loading {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    card: {
        background: '#0d0d1a',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '650px',
        border: '1px solid #7c3aed33',
        boxShadow: '0 0 40px #7c3aed22'
    },
    scoreCircle: {
        textAlign: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, #1a0533, #2d1052)',
        borderRadius: '16px',
        marginBottom: '24px',
        border: '1px solid #7c3aed44'
    },
    emoji: { fontSize: '48px', display: 'block', marginBottom: '8px' },
    percentage: {
        color: '#a78bfa',
        fontSize: '48px',
        margin: '0 0 8px',
        fontWeight: '800'
    },
    message: {
        color: '#e2e8f0',
        margin: '0 0 4px',
        fontSize: '18px',
        fontWeight: '600'
    },
    scoreText: { color: '#6b7280', margin: 0, fontSize: '14px' },
    reportSection: {
        background: '#0a0a0f',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #1e1b4b'
    },
    reportTitle: {
        color: '#e2e8f0',
        fontSize: '18px',
        fontWeight: '700',
        margin: '0 0 16px'
    },
    loadingBox: { textAlign: 'center', padding: '20px' },
    loadingText: { color: '#a78bfa', marginBottom: '12px', fontSize: '14px' },
    loadingBar: {
        height: '4px',
        background: '#1e1b4b',
        borderRadius: '10px',
        overflow: 'hidden'
    },
    loadingFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
        borderRadius: '10px',
        animation: 'loading 2s ease infinite'
    },
    feedbackBox: {
        background: '#1a0a2e',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '16px',
        border: '1px solid #7c3aed44'
    },
    feedbackText: { color: '#a78bfa', margin: 0, fontSize: '14px', lineHeight: '1.6' },
    topicSection: { marginBottom: '16px' },
    topicTitle: {
        color: '#e2e8f0',
        fontSize: '14px',
        fontWeight: '700',
        margin: '0 0 10px'
    },
    tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    strongTag: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        background: '#052e16',
        color: '#4ade80',
        border: '1px solid #16a34a44'
    },
    weakTag: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        background: '#1c1a00',
        color: '#facc15',
        border: '1px solid #ca8a0444'
    },
    recommendList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    recommendItem: {
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        background: '#0d0d1a',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #1e1b4b'
    },
    recommendNum: {
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: '700',
        flexShrink: 0
    },
    recommendText: { color: '#9ca3af', margin: 0, fontSize: '13px', lineHeight: '1.5' },
    errorText: { color: '#6b7280', textAlign: 'center', fontSize: '14px' },
    reviewTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#e2e8f0',
        marginBottom: '12px'
    },
    reviewList: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' },
    reviewItem: {
        padding: '12px 16px',
        background: '#0a0a0f',
        borderRadius: '0 10px 10px 0',
        border: '1px solid #1e1b4b'
    },
    reviewQuestion: {
        margin: '0 0 6px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#e2e8f0'
    },
    reviewAnswer: { margin: '0 0 4px', fontSize: '13px' },
    correctAnswer: { margin: '0 0 4px', fontSize: '13px', color: '#4ade80' },
    explanation: {
        margin: '4px 0 0',
        fontSize: '12px',
        color: '#6b7280',
        fontStyle: 'italic'
    },
    buttons: { display: 'flex', gap: '12px' },
    generateBtn: {
        flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
        background: 'linear-gradient(135deg, #7c3aed, #764ba2)',
        color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer'
    },
    dashboardBtn: {
        flex: 1, padding: '14px', borderRadius: '12px',
        border: '1px solid #7c3aed', background: 'transparent',
        color: '#a78bfa', fontSize: '15px', fontWeight: '700', cursor: 'pointer'
    }

    ,

    shareBtn: {
        width: '100%',
        padding: '12px',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        marginBottom: '12px',
        transition: 'all 0.3s ease'
    }
};