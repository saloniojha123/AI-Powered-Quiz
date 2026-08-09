/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api';

export default function TakeQuiz() {
    const { state } = useLocation();
    const quiz = state?.quiz;
    const navigate = useNavigate();

    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [timerActive, setTimerActive] = useState(true);
    const [showExplanation, setShowExplanation] = useState(false);

    const question = quiz?.questions[current];
    const isLast = current === quiz?.questions.length - 1;

    useEffect(() => {
        if (!quiz) return;
        if (!timerActive) return;
        if (timeLeft === 0) {
            setTimerActive(false);
            const newAnswers = [...answers, -1];
            if (isLast) {
                const score = newAnswers.filter(
                    (ans, i) => ans === quiz.questions[i].correctOptionIndex
                ).length;
                API.post('/score/submit', {
                    quizId: quiz.id,
                    score,
                    totalQuestions: quiz.questions.length
                }).then(() => {
                    navigate('/results', {
                        state: {
                            score,
                            totalQuestions: quiz.questions.length,
                            answers: newAnswers,
                            quiz
                        }
                    });
                });
            } else {
                setAnswers(newAnswers);
                setCurrent(c => c + 1);
                setSelected(null);
                setShowExplanation(false);
            }
            return;
        }
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, timerActive]);

    useEffect(() => {
        if (!quiz) return;
        setTimeLeft(30);
        setTimerActive(true);
        setShowExplanation(false);
    }, [current]);

    if (!quiz) { navigate('/dashboard'); return null; }

    const handleOptionSelect = (i) => {
        setSelected(i);
        setShowExplanation(true);
        setTimerActive(false);
    };

    const handleNext = async (timeout) => {
        setTimerActive(false);
        setShowExplanation(false);
        const answer = timeout ? -1 : selected;
        const newAnswers = [...answers, answer];

        if (isLast) {
            setSubmitting(true);
            const score = newAnswers.filter(
                (ans, i) => ans === quiz.questions[i].correctOptionIndex
            ).length;
            try {
                await API.post('/score/submit', {
                    quizId: quiz.id,
                    score,
                    totalQuestions: quiz.questions.length
                });
                navigate('/results', {
                    state: {
                        score,
                        totalQuestions: quiz.questions.length,
                        answers: newAnswers,
                        quiz
                    }
                });
            } catch (err) {
                console.error(err);
            }
            setSubmitting(false);
        } else {
            setAnswers(newAnswers);
            setCurrent(current + 1);
            setSelected(null);
        }
    };

    const progress = ((current + 1) / quiz.questions.length) * 100;
    const timerColor = timeLeft > 15 ? '#4ade80' : timeLeft > 5 ? '#facc15' : '#f87171';
    const timerBg = timeLeft > 15 ? '#052e16' : timeLeft > 5 ? '#1c1a00' : '#1c0a0a';
    const isCorrect = selected === question.correctOptionIndex;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.topicTitle}>{quiz.topicTitle}</h2>
                        <span style={styles.counter}>
                            {current + 1}/{quiz.questions.length}
                        </span>
                    </div>
                    <div style={{
                        padding: '8px 16px',
                        borderRadius: '12px',
                        fontSize: '18px',
                        fontWeight: '700',
                        minWidth: '80px',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        background: timerBg,
                        border: '2px solid ' + timerColor,
                        color: timerColor,
                        animation: timeLeft <= 5 ? 'pulse 0.5s infinite' : 'none'
                    }}>
                        {timeLeft}s
                    </div>
                </div>

                <div style={styles.progressBar}>
                    <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
                        borderRadius: '10px',
                        transition: 'width 0.3s ease',
                        width: progress + '%'
                    }} />
                </div>

                <div style={styles.timerBar}>
                    <div style={{
                        height: '100%',
                        borderRadius: '10px',
                        width: ((timeLeft / 30) * 100) + '%',
                        background: timerColor,
                        transition: 'width 1s linear, background 0.3s ease'
                    }} />
                </div>

                <h3 style={styles.question}>{question.questionText}</h3>

                <div style={styles.options}>
                    {question.options.map((opt, i) => {
                        let optStyle = styles.option;
                        if (showExplanation) {
                            if (i === question.correctOptionIndex) {
                                optStyle = styles.optionCorrect;
                            } else if (i === selected) {
                                optStyle = styles.optionWrong;
                            }
                        } else if (selected === i) {
                            optStyle = styles.optionSelected;
                        }
                        return (
                            <button
                                key={i}
                                style={optStyle}
                                onClick={() => !showExplanation && handleOptionSelect(i)}
                            >
                                <span style={styles.optionLetter}>
                                    {['A', 'B', 'C', 'D'][i]}
                                </span>
                                {opt}
                            </button>
                        );
                    })}
                </div>

                {showExplanation && selected !== null && (
                    <div style={{
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '16px',
                        background: isCorrect ? '#052e16' : '#1c0a0a',
                        border: '1px solid ' + (isCorrect ? '#16a34a' : '#dc2626'),
                    }}>
                        <p style={{
                            margin: '0 0 6px',
                            fontWeight: '700',
                            color: isCorrect ? '#4ade80' : '#f87171',
                            fontSize: '14px'
                        }}>
                            {isCorrect ? 'Correct!' : 'Incorrect!'}
                        </p>
                        <p style={{
                            margin: 0,
                            color: '#e2e8f0',
                            fontSize: '14px',
                            lineHeight: '1.6'
                        }}>
                            {question.explanation
                                ? question.explanation
                                : 'The correct answer is: ' + question.options[question.correctOptionIndex]}
                        </p>
                    </div>
                )}

                <button
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        marginBottom: '10px',
                        transition: 'all 0.3s ease',
                        opacity: selected === null ? 0.5 : 1
                    }}
                    onClick={() => handleNext(false)}
                    disabled={selected === null || submitting}
                >
                    {submitting ? 'Submitting...' : isLast ? 'Finish Quiz' : 'Next'}
                </button>

                <button
                    style={styles.skipBtn}
                    onClick={() => handleNext(true)}
                >
                    Skip question
                </button>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
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
        maxWidth: '600px',
        border: '1px solid #7c3aed33',
        boxShadow: '0 0 40px #7c3aed22'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
    },
    topicTitle: {
        margin: '0 0 6px',
        fontSize: '18px',
        color: '#a78bfa',
        fontWeight: '700'
    },
    counter: {
        background: '#1e1b4b',
        color: '#a78bfa',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px'
    },
    progressBar: {
        height: '4px',
        background: '#1e1b4b',
        borderRadius: '10px',
        marginBottom: '8px'
    },
    timerBar: {
        height: '3px',
        background: '#1e1b4b',
        borderRadius: '10px',
        marginBottom: '24px'
    },
    question: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#e2e8f0',
        marginBottom: '20px',
        lineHeight: '1.6'
    },
    options: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '16px'
    },
    option: {
        padding: '14px 18px',
        borderRadius: '12px',
        border: '1px solid #1e1b4b',
        background: '#0a0a0f',
        cursor: 'pointer',
        fontSize: '14px',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#9ca3af',
        transition: 'all 0.2s ease'
    },
    optionSelected: {
        padding: '14px 18px',
        borderRadius: '12px',
        border: '1px solid #7c3aed',
        background: '#1a0a2e',
        cursor: 'pointer',
        fontSize: '14px',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#a78bfa',
        transition: 'all 0.2s ease'
    },
    optionCorrect: {
        padding: '14px 18px',
        borderRadius: '12px',
        border: '1px solid #16a34a',
        background: '#052e16',
        cursor: 'default',
        fontSize: '14px',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#4ade80',
        transition: 'all 0.2s ease'
    },
    optionWrong: {
        padding: '14px 18px',
        borderRadius: '12px',
        border: '1px solid #dc2626',
        background: '#1c0a0a',
        cursor: 'default',
        fontSize: '14px',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#f87171',
        transition: 'all 0.2s ease'
    },
    optionLetter: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '700',
        flexShrink: 0
    },
    skipBtn: {
        width: '100%',
        padding: '10px',
        borderRadius: '12px',
        border: '1px solid #1e1b4b',
        background: 'transparent',
        color: '#4b5563',
        fontSize: '14px',
        cursor: 'pointer'
    }
};