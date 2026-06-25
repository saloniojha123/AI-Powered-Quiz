import React, { useState } from 'react';
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

    if (!quiz) {
        navigate('/dashboard');
        return null;
    }

    const question = quiz.questions[current];
    const isLast = current === quiz.questions.length - 1;

    const handleNext = async () => {
        const newAnswers = [...answers, selected];

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
                    state: { score, totalQuestions: quiz.questions.length, answers: newAnswers, quiz }
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

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.topicTitle}>{quiz.topicTitle}</h2>
                    <span style={styles.counter}>{current + 1}/{quiz.questions.length}</span>
                </div>

                {/* Progress Bar */}
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                </div>

                {/* Question */}
                <h3 style={styles.question}>{question.questionText}</h3>

                {/* Options */}
                <div style={styles.options}>
                    {question.options.map((opt, i) => (
                        <button
                            key={i}
                            style={{
                                ...styles.option,
                                ...(selected === i ? styles.optionSelected : {})
                            }}
                            onClick={() => setSelected(i)}
                        >
                            <span style={styles.optionLetter}>
                                {['A', 'B', 'C', 'D'][i]}
                            </span>
                            {opt}
                        </button>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    style={{
                        ...styles.nextBtn,
                        opacity: selected === null ? 0.5 : 1
                    }}
                    onClick={handleNext}
                    disabled={selected === null || submitting}
                >
                    {submitting ? 'Submitting...' : isLast ? '🏁 Finish Quiz' : 'Next →'}
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    },
    card: {
        background: 'white', borderRadius: '20px', padding: '40px',
        width: '100%', maxWidth: '600px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    topicTitle: { margin: 0, fontSize: '18px', color: '#667eea', fontWeight: '700' },
    counter: { background: '#f0f2ff', color: '#667eea', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' },
    progressBar: { height: '6px', background: '#eee', borderRadius: '10px', marginBottom: '32px' },
    progressFill: { height: '100%', background: 'linear-gradient(135deg, #667eea, #f093fb)', borderRadius: '10px', transition: 'width 0.3s ease' },
    question: { fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '24px', lineHeight: '1.5' },
    options: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
    option: {
        padding: '14px 18px', borderRadius: '12px', border: '2px solid #eee',
        background: 'white', cursor: 'pointer', fontSize: '15px', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: '12px', color: '#333',
        transition: 'all 0.2s ease'
    },
    optionSelected: { border: '2px solid #667eea', background: '#f0f2ff', color: '#667eea' },
    optionLetter: {
        width: '28px', height: '28px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: '700', flexShrink: 0
    },
    nextBtn: {
        width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
        background: 'linear-gradient(135deg, #667eea, #f093fb)',
        color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer'
    }
};