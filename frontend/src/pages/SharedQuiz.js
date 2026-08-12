/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

export default function SharedQuiz() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [showExplanation, setShowExplanation] = useState(false);
    const [finished, setFinished] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await API.get(`/quiz/share/${id}`);
                setQuiz(res.data.quiz);
            } catch (err) {
                setError('Quiz not found or link is invalid');
            }
            setLoading(false);
        };
        fetchQuiz();
    }, []);

    if (loading) return (
        <div style={styles.container}>
            <div style={styles.card}>
                <p style={styles.loadingText}>🤖 Loading shared quiz...</p>
            </div>
        </div>
    );

    if (error) return (
        <div style={styles.container}>
            <div style={styles.card}>
                <p style={styles.errorText}>{error}</p>
                <button style={styles.btn} onClick={() => navigate('/login')}>
                    Go to App
                </button>
            </div>
        </div>
    );

    if (finished) {
        const percentage = Math.round((score / quiz.questions.length) * 100);
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.scoreBox}>
                        <span style={styles.emoji}>
                            {percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : '💪'}
                        </span>
                        <h2 style={styles.percentage}>{percentage}%</h2>
                        <p style={styles.scoreText}>
                            {score}/{quiz.questions.length} correct
                        </p>
                        <p style={styles.topicBadge}>{quiz.topicTitle}</p>
                    </div>
                    <div style={styles.reviewList}>
                        {quiz.questions.map((q, i) => {
                            const isCorrect = answers[i] === q.correctOptionIndex;
                            return (
                                <div key={i} style={{
                                    ...styles.reviewItem,
                                    borderLeft: '4px solid ' + (isCorrect ? '#4ade80' : '#f87171')
                                }}>
                                    <p style={styles.reviewQ}>{i + 1}. {q.questionText}</p>
                                    <p style={{ color: isCorrect ? '#4ade80' : '#f87171', fontSize: '13px', margin: '4px 0' }}>
                                        {isCorrect ? '✅' : '❌'} {q.options[answers[i]] || 'Skipped'}
                                    </p>
                                    {!isCorrect && (
                                        <p style={{ color: '#4ade80', fontSize: '13px', margin: '2px 0' }}>
                                            ✅ {q.options[q.correctOptionIndex]}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <button style={styles.btn} onClick={() => navigate('/register')}>
                        🚀 Create Your Own Quiz
                    </button>
                </div>
            </div>
        );
    }

    const question = quiz.questions[current];
    const isLast = current === quiz.questions.length - 1;
    const isCorrect = selected === question.correctOptionIndex;

    const handleSelect = (i) => {
        if (showExplanation) return;
        setSelected(i);
        setShowExplanation(true);
    };

    const handleNext = () => {
        const newAnswers = [...answers, selected];
        if (isLast) {
            const finalScore = newAnswers.filter(
                (ans, i) => ans === quiz.questions[i].correctOptionIndex
            ).length;
            setScore(finalScore);
            setAnswers(newAnswers);
            setFinished(true);
        } else {
            setAnswers(newAnswers);
            setCurrent(current + 1);
            setSelected(null);
            setShowExplanation(false);
        }
    };

    const progress = ((current + 1) / quiz.questions.length) * 100;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.topicTitle}>{quiz.topicTitle}</h2>
                        <div style={styles.badges}>
                            <span style={styles.counter}>{current + 1}/{quiz.questions.length}</span>
                            <span style={{
                                ...styles.diffBadge,
                                color: quiz.difficulty === 'easy' ? '#4ade80' : quiz.difficulty === 'hard' ? '#f87171' : '#facc15',
                                background: quiz.difficulty === 'easy' ? '#052e16' : quiz.difficulty === 'hard' ? '#1c0a0a' : '#1c1a00',
                            }}>
                                {quiz.difficulty === 'easy' ? '🟢' : quiz.difficulty === 'hard' ? '🔴' : '🟡'} {quiz.difficulty}
                            </span>
                        </div>
                    </div>
                    <span style={styles.sharedBadge}>🔗 Shared Quiz</span>
                </div>

                <div style={styles.progressBar}>
                    <div style={{ height: '100%', width: progress + '%', background: 'linear-gradient(90deg, #7c3aed, #ec4899)', borderRadius: '10px', transition: 'width 0.3s ease' }} />
                </div>

                <h3 style={styles.question}>{question.questionText}</h3>

                <div style={styles.options}>
                    {question.options.map((opt, i) => {
                        let optStyle = styles.option;
                        if (showExplanation) {
                            if (i === question.correctOptionIndex) optStyle = styles.optionCorrect;
                            else if (i === selected) optStyle = styles.optionWrong;
                        } else if (selected === i) {
                            optStyle = styles.optionSelected;
                        }
                        return (
                            <button key={i} style={optStyle} onClick={() => handleSelect(i)}>
                                <span style={styles.optionLetter}>{['A', 'B', 'C', 'D'][i]}</span>
                                {opt}
                            </button>
                        );
                    })}
                </div>

                {showExplanation && selected !== null && (
                    <div style={{
                        padding: '14px', borderRadius: '12px', marginBottom: '16px',
                        background: isCorrect ? '#052e16' : '#1c0a0a',
                        border: '1px solid ' + (isCorrect ? '#16a34a' : '#dc2626')
                    }}>
                        <p style={{ margin: '0 0 6px', fontWeight: '700', color: isCorrect ? '#4ade80' : '#f87171', fontSize: '14px' }}>
                            {isCorrect ? 'Correct!' : 'Incorrect!'}
                        </p>
                        <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', lineHeight: '1.6' }}>
                            {question.explanation || 'Correct answer: ' + question.options[question.correctOptionIndex]}
                        </p>
                    </div>
                )}

                <button
                    style={{ ...styles.nextBtn, opacity: selected === null ? 0.5 : 1 }}
                    onClick={handleNext}
                    disabled={selected === null}
                >
                    {isLast ? '🏁 Finish Quiz' : 'Next →'}
                </button>

                <p style={styles.promoText}>
                    Want to create your own AI quiz? <span style={styles.promoLink} onClick={() => navigate('/register')}>Sign up free →</span>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { background: '#0d0d1a', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '600px', border: '1px solid #7c3aed33', boxShadow: '0 0 40px #7c3aed22' },
    loadingText: { color: '#a78bfa', textAlign: 'center', fontSize: '16px' },
    errorText: { color: '#f87171', textAlign: 'center', fontSize: '16px', marginBottom: '16px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
    topicTitle: { margin: '0 0 6px', fontSize: '18px', color: '#a78bfa', fontWeight: '700' },
    badges: { display: 'flex', gap: '8px', alignItems: 'center' },
    counter: { background: '#1e1b4b', color: '#a78bfa', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' },
    diffBadge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    sharedBadge: { background: '#1a0a2e', color: '#a78bfa', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', border: '1px solid #7c3aed44' },
    progressBar: { height: '4px', background: '#1e1b4b', borderRadius: '10px', marginBottom: '24px' },
    question: { fontSize: '18px', fontWeight: '600', color: '#e2e8f0', marginBottom: '20px', lineHeight: '1.6' },
    options: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' },
    option: { padding: '14px 18px', borderRadius: '12px', border: '1px solid #1e1b4b', background: '#0a0a0f', cursor: 'pointer', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', color: '#9ca3af', transition: 'all 0.2s ease' },
    optionSelected: { padding: '14px 18px', borderRadius: '12px', border: '1px solid #7c3aed', background: '#1a0a2e', cursor: 'pointer', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', color: '#a78bfa', transition: 'all 0.2s ease' },
    optionCorrect: { padding: '14px 18px', borderRadius: '12px', border: '1px solid #16a34a', background: '#052e16', cursor: 'default', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', color: '#4ade80', transition: 'all 0.2s ease' },
    optionWrong: { padding: '14px 18px', borderRadius: '12px', border: '1px solid #dc2626', background: '#1c0a0a', cursor: 'default', fontSize: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', color: '#f87171', transition: 'all 0.2s ease' },
    optionLetter: { width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 },
    nextBtn: { width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginBottom: '16px' },
    btn: { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
    scoreBox: { textAlign: 'center', padding: '24px', background: 'linear-gradient(135deg, #1a0533, #2d1052)', borderRadius: '16px', marginBottom: '20px', border: '1px solid #7c3aed44' },
    emoji: { fontSize: '48px', display: 'block', marginBottom: '8px' },
    percentage: { color: '#a78bfa', fontSize: '48px', margin: '0 0 8px', fontWeight: '800' },
    scoreText: { color: '#e2e8f0', margin: '0 0 8px', fontSize: '16px' },
    topicBadge: { color: '#6b7280', margin: 0, fontSize: '13px' },
    reviewList: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
    reviewItem: { padding: '12px 16px', background: '#0a0a0f', borderRadius: '0 10px 10px 0', border: '1px solid #1e1b4b' },
    reviewQ: { margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#e2e8f0' },
    promoText: { textAlign: 'center', color: '#6b7280', fontSize: '13px', marginTop: '12px' },
    promoLink: { color: '#a78bfa', cursor: 'pointer', fontWeight: '600' }
};