import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function GenerateQuiz() {
    const [mode, setMode] = useState('text');
    const [text, setText] = useState('');
    const [pdf, setPdf] = useState(null);
    const [topicTitle, setTopicTitle] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            let res;
            if (mode === 'pdf' && pdf) {
                const formData = new FormData();
                formData.append('pdf', pdf);
                formData.append('topicTitle', topicTitle || 'My Quiz');
                formData.append('difficulty', difficulty);
                res = await API.post('/quiz/generate', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await API.post('/quiz/generate', {
                    text,
                    topicTitle: topicTitle || 'My Quiz',
                    difficulty
                });
            }
            navigate(`/quiz/${res.data.quiz.id}`, { state: { quiz: res.data.quiz } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate quiz');
        }
        setLoading(false);
    };

    const difficultyConfig = {
        easy: { color: '#4ade80', bg: '#052e16', border: '#16a34a', label: '🟢 Easy', desc: 'Basic concepts, clear options' },
        medium: { color: '#facc15', bg: '#1c1a00', border: '#ca8a04', label: '🟡 Medium', desc: 'Conceptual understanding required' },
        hard: { color: '#f87171', bg: '#1c0a0a', border: '#dc2626', label: '🔴 Hard', desc: 'Deep analysis, tricky options' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
                    ← Back
                </button>
                <h2 style={styles.title}>✨ Generate Quiz</h2>
                <p style={styles.subtitle}>Paste your notes or upload a PDF</p>

                {/* Mode Toggle */}
                <div style={styles.toggle}>
                    <button
                        style={mode === 'text' ? styles.toggleActive : styles.toggleBtn}
                        onClick={() => setMode('text')}
                    >
                        📝 Paste Text
                    </button>
                    <button
                        style={mode === 'pdf' ? styles.toggleActive : styles.toggleBtn}
                        onClick={() => setMode('pdf')}
                    >
                        📄 Upload PDF
                    </button>
                </div>

                {/* Topic Input */}
                <input
                    style={styles.input}
                    placeholder="Topic title (e.g. Photosynthesis)"
                    value={topicTitle}
                    onChange={e => setTopicTitle(e.target.value)}
                />

                {/* Difficulty Selector */}
                <div style={styles.difficultySection}>
                    <p style={styles.difficultyLabel}>⚡ Select Difficulty</p>
                    <div style={styles.difficultyBtns}>
                        {['easy', 'medium', 'hard'].map(level => {
                            const config = difficultyConfig[level];
                            const isActive = difficulty === level;
                            return (
                                <button
                                    key={level}
                                    style={{
                                        ...styles.diffBtn,
                                        ...(isActive ? {
                                            border: '2px solid ' + config.border,
                                            background: config.bg,
                                            color: config.color,
                                            boxShadow: '0 0 12px ' + config.border + '44'
                                        } : {})
                                    }}
                                    onClick={() => setDifficulty(level)}
                                >
                                    <span style={styles.diffLabel}>{config.label}</span>
                                    <span style={styles.diffDesc}>{config.desc}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Text or PDF input */}
                {mode === 'text' ? (
                    <textarea
                        style={styles.textarea}
                        placeholder="Paste your study notes here (minimum 100 characters)..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                        rows={8}
                    />
                ) : (
                    <div style={styles.uploadArea}>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={e => setPdf(e.target.files[0])}
                            style={{ display: 'none' }}
                            id="pdfInput"
                        />
                        <label htmlFor="pdfInput" style={styles.uploadLabel}>
                            {pdf ? '✅ ' + pdf.name : '📁 Click to upload PDF'}
                        </label>
                    </div>
                )}

                {error && <div style={styles.error}>{error}</div>}

                <button
                    style={{
                        ...styles.generateBtn,
                        opacity: loading ? 0.7 : 1
                    }}
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? '🤖 Generating ' + difficulty + ' quiz...' : '🚀 Generate Quiz'}
                </button>

                {/* Difficulty info banner */}
                <div style={{
                    ...styles.infoBanner,
                    background: difficultyConfig[difficulty].bg,
                    border: '1px solid ' + difficultyConfig[difficulty].border + '44',
                    color: difficultyConfig[difficulty].color
                }}>
                    {difficulty === 'easy' && '💡 Easy mode: Perfect for beginners or quick revision'}
                    {difficulty === 'medium' && '📘 Medium mode: Tests your conceptual understanding'}
                    {difficulty === 'hard' && '🔥 Hard mode: Challenges your deep knowledge and critical thinking'}
                </div>
            </div>
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
        maxWidth: '560px',
        border: '1px solid #7c3aed33',
        boxShadow: '0 0 40px #7c3aed22'
    },
    backBtn: {
        background: 'none',
        border: 'none',
        color: '#a78bfa',
        cursor: 'pointer',
        fontSize: '15px',
        marginBottom: '16px',
        padding: 0
    },
    title: {
        fontSize: '26px',
        fontWeight: '700',
        color: '#e2e8f0',
        margin: '0 0 8px'
    },
    subtitle: { color: '#6b7280', marginBottom: '24px', fontSize: '14px' },
    toggle: { display: 'flex', gap: '8px', marginBottom: '16px' },
    toggleBtn: {
        flex: 1,
        padding: '10px',
        borderRadius: '10px',
        border: '1px solid #1e1b4b',
        background: '#0a0a0f',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        color: '#6b7280'
    },
    toggleActive: {
        flex: 1,
        padding: '10px',
        borderRadius: '10px',
        border: '2px solid #7c3aed',
        background: '#1a0a2e',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        color: '#a78bfa'
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        marginBottom: '16px',
        borderRadius: '10px',
        border: '1px solid #1e1b4b',
        background: '#0a0a0f',
        fontSize: '15px',
        boxSizing: 'border-box',
        outline: 'none',
        color: '#e2e8f0'
    },
    difficultySection: { marginBottom: '16px' },
    difficultyLabel: {
        color: '#a78bfa',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '10px'
    },
    difficultyBtns: { display: 'flex', gap: '8px' },
    diffBtn: {
        flex: 1,
        padding: '10px 8px',
        borderRadius: '10px',
        border: '1px solid #1e1b4b',
        background: '#0a0a0f',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
    },
    diffLabel: { fontSize: '13px', fontWeight: '700', color: 'inherit' },
    diffDesc: { fontSize: '10px', color: '#6b7280', textAlign: 'center' },
    textarea: {
        width: '100%',
        padding: '12px 16px',
        marginBottom: '12px',
        borderRadius: '10px',
        border: '1px solid #1e1b4b',
        background: '#0a0a0f',
        fontSize: '15px',
        boxSizing: 'border-box',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        color: '#e2e8f0'
    },
    uploadArea: { marginBottom: '12px' },
    uploadLabel: {
        display: 'block',
        padding: '32px',
        borderRadius: '10px',
        border: '2px dashed #7c3aed',
        textAlign: 'center',
        cursor: 'pointer',
        color: '#a78bfa',
        fontWeight: '600',
        fontSize: '15px'
    },
    error: {
        background: '#1c0a0a',
        color: '#f87171',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '12px',
        fontSize: '14px',
        border: '1px solid #dc262644'
    },
    generateBtn: {
        width: '100%',
        padding: '16px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #7c3aed, #ec4899, #06b6d4)',
        color: 'white',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        marginBottom: '12px',
        transition: 'all 0.3s ease'
    },
    infoBanner: {
        padding: '10px 14px',
        borderRadius: '10px',
        fontSize: '13px',
        textAlign: 'center',
        fontWeight: '500'
    }
};