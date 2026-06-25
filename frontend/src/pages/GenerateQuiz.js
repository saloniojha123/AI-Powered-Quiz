import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function GenerateQuiz() {
    const [mode, setMode] = useState('text'); // 'text' or 'pdf'
    const [text, setText] = useState('');
    const [pdf, setPdf] = useState(null);
    const [topicTitle, setTopicTitle] = useState('');
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
                res = await API.post('/quiz/generate', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await API.post('/quiz/generate', {
                    text,
                    topicTitle: topicTitle || 'My Quiz'
                });
            }
            navigate(`/quiz/${res.data.quiz.id}`, { state: { quiz: res.data.quiz } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate quiz');
        }
        setLoading(false);
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
                        style={{ ...styles.toggleBtn, ...(mode === 'text' ? styles.toggleActive : {}) }}
                        onClick={() => setMode('text')}
                    >📝 Paste Text</button>
                    <button
                        style={{ ...styles.toggleBtn, ...(mode === 'pdf' ? styles.toggleActive : {}) }}
                        onClick={() => setMode('pdf')}
                    >📄 Upload PDF</button>
                </div>

                {/* Topic Input */}
                <input
                    style={styles.input}
                    placeholder="Topic title (e.g. Photosynthesis)"
                    value={topicTitle}
                    onChange={e => setTopicTitle(e.target.value)}
                />

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
                            {pdf ? `✅ ${pdf.name}` : '📁 Click to upload PDF'}
                        </label>
                    </div>
                )}

                {error && <div style={styles.error}>{error}</div>}

                <button
                    style={styles.generateBtn}
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? '🤖 Generating quiz...' : '🚀 Generate Quiz'}
                </button>
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
        width: '100%', maxWidth: '560px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    },
    backBtn: {
        background: 'none', border: 'none', color: '#667eea',
        cursor: 'pointer', fontSize: '15px', marginBottom: '16px', padding: 0
    },
    title: { fontSize: '26px', fontWeight: '700', color: '#333', margin: '0 0 8px' },
    subtitle: { color: '#888', marginBottom: '24px', fontSize: '14px' },
    toggle: { display: 'flex', gap: '8px', marginBottom: '20px' },
    toggleBtn: {
        flex: 1, padding: '10px', borderRadius: '10px',
        border: '2px solid #e0e0e0', background: 'white',
        cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#888'
    },
    toggleActive: {
        border: '2px solid #667eea', color: '#667eea',
        background: '#f0f2ff'
    },
    input: {
        width: '100%', padding: '12px 16px', marginBottom: '12px',
        borderRadius: '10px', border: '1px solid #ddd', fontSize: '15px',
        boxSizing: 'border-box', outline: 'none'
    },
    textarea: {
        width: '100%', padding: '12px 16px', marginBottom: '12px',
        borderRadius: '10px', border: '1px solid #ddd', fontSize: '15px',
        boxSizing: 'border-box', outline: 'none', resize: 'vertical', fontFamily: 'inherit'
    },
    uploadArea: { marginBottom: '12px' },
    uploadLabel: {
        display: 'block', padding: '32px', borderRadius: '10px',
        border: '2px dashed #667eea', textAlign: 'center',
        cursor: 'pointer', color: '#667eea', fontWeight: '600', fontSize: '15px'
    },
    error: {
        background: '#ffe0e0', color: '#c00', padding: '10px',
        borderRadius: '8px', marginBottom: '12px', fontSize: '14px'
    },
    generateBtn: {
        width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
        background: 'linear-gradient(135deg, #667eea, #f093fb)',
        color: 'white', fontSize: '16px', fontWeight: '700',
        cursor: 'pointer', marginTop: '8px'
    }
};