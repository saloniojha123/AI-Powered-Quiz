import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoverGenerate, setHoverGenerate] = useState(false);
    const [hoverLogout, setHoverLogout] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, historyRes] = await Promise.all([
                    API.get('/score/stats'),
                    API.get('/score/history')
                ]);
                setStats(statsRes.data);
                setHistory(historyRes.data.history);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div style={styles.container}>
            {/* Navbar */}
            <div style={styles.navbar}>
                <h1 style={styles.logo}>🧠 QuizAI</h1>
                <div style={styles.navRight}>
                    <span style={styles.welcome}>Hi, {user?.username}! 👋</span>
                    <button
                        style={{
                            ...styles.logoutBtn,
                            transform: hoverLogout ? 'scale(1.08)' : 'scale(1)',
                            background: hoverLogout ? '#7c3aed22' : 'transparent',
                            borderColor: hoverLogout ? '#ec4899' : '#7c3aed',
                            color: hoverLogout ? '#f472b6' : '#a78bfa',
                        }}
                        onClick={handleLogout}
                        onMouseEnter={() => setHoverLogout(true)}
                        onMouseLeave={() => setHoverLogout(false)}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div style={styles.content}>
                {loading ? (
                    <p style={styles.loading}>Loading your stats...</p>
                ) : (
                    <>
                        {/* Stats */}
                        <div style={styles.statsGrid}>
                            {[
                                { num: stats?.totalQuizzes || 0, label: 'Total Quizzes', color: '#a78bfa', bg: 'linear-gradient(135deg, #1a0533, #2d1052)', border: '#7c3aed44' },
                                { num: stats?.averageScore || '0%', label: 'Average Score', color: '#22d3ee', bg: 'linear-gradient(135deg, #001a1a, #002d2d)', border: '#06b6d444' },
                                { num: stats?.bestScore || '0%', label: 'Best Score', color: '#f472b6', bg: 'linear-gradient(135deg, #1a0033, #2d0052)', border: '#ec489944' },
                                { num: '🏆', label: stats?.bestTopic || 'No topic yet', color: '#4ade80', bg: 'linear-gradient(135deg, #001a00, #002d00)', border: '#22c55e44' },
                            ].map((s, i) => (
                                <div key={i} style={{
                                    ...styles.statCard,
                                    background: s.bg,
                                    border: `1px solid ${s.border}`,
                                    transform: hoveredCard === i ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
                                    boxShadow: hoveredCard === i ? `0 8px 30px ${s.border}` : 'none',
                                }}
                                    onMouseEnter={() => setHoveredCard(i)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <h3 style={{ ...styles.statNumber, color: s.color }}>{s.num}</h3>
                                    <p style={styles.statLabel}>{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Generate Button */}
                        <button
                            style={{
                                ...styles.generateBtn,
                                transform: hoverGenerate ? 'scale(1.03)' : 'scale(1)',
                                boxShadow: hoverGenerate
                                    ? '0 0 40px #7c3aed99, 0 0 80px #ec489944'
                                    : '0 0 20px #7c3aed44',
                                background: hoverGenerate
                                    ? 'linear-gradient(135deg, #ec4899, #7c3aed, #06b6d4)'
                                    : 'linear-gradient(135deg, #7c3aed, #ec4899, #06b6d4)',
                            }}
                            onClick={() => navigate('/generate')}
                            onMouseEnter={() => setHoverGenerate(true)}
                            onMouseLeave={() => setHoverGenerate(false)}
                        >
                            ✨ Generate New Quiz
                        </button>

                        {/* History */}
                        <h2 style={styles.sectionTitle}>Recent Quizzes</h2>
                        {history.length === 0 ? (
                            <div style={styles.emptyState}>
                                <p>No quizzes yet! Generate your first quiz 🚀</p>
                            </div>
                        ) : (
                            <div style={styles.historyList}>
                                {history.map((item, i) => (
                                    <div key={item.id} style={{
                                        ...styles.historyCard,
                                        border: hoveredCard === `h${i}`
                                            ? '1px solid #7c3aed66'
                                            : '1px solid #1e1b4b',
                                        transform: hoveredCard === `h${i}` ? 'translateX(6px)' : 'translateX(0)',
                                    }}
                                        onMouseEnter={() => setHoveredCard(`h${i}`)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                    >
                                        <div>
                                            <h3 style={styles.topicTitle}>{item.topicTitle}</h3>
                                            <p style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</p>
                                        </div>
                                        <div style={styles.scoreChip(item.percentage)}>
                                            {item.score}/{item.totalQuestions} ({item.percentage}%)
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: '#0a0a0f' },
    navbar: {
        background: 'linear-gradient(90deg, #0d0d1a, #1a0a2e)',
        padding: '16px 32px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #7c3aed33'
    },
    logo: { color: '#a78bfa', margin: 0, fontSize: '24px' },
    navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    welcome: { color: '#6b7280', fontSize: '15px' },
    logoutBtn: {
        padding: '8px 16px', borderRadius: '8px',
        border: '1px solid #7c3aed', background: 'transparent',
        color: '#a78bfa', cursor: 'pointer', fontSize: '14px',
        transition: 'all 0.3s ease',
    },
    content: { maxWidth: '900px', margin: '0 auto', padding: '32px 20px' },
    loading: { textAlign: 'center', color: '#6b7280', fontSize: '16px' },
    statsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '32px'
    },
    statCard: {
        borderRadius: '16px', padding: '24px', textAlign: 'center',
        cursor: 'pointer', transition: 'all 0.3s ease',
    },
    statNumber: { fontSize: '32px', margin: '0 0 8px', fontWeight: '700' },
    statLabel: { color: '#6b7280', margin: 0, fontSize: '14px' },
    generateBtn: {
        width: '100%', padding: '18px', borderRadius: '14px', border: 'none',
        color: 'white', fontSize: '18px', fontWeight: '700',
        cursor: 'pointer', marginBottom: '32px', transition: 'all 0.3s ease',
        letterSpacing: '0.5px',
    },
    sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#e2e8f0', marginBottom: '16px' },
    emptyState: {
        textAlign: 'center', padding: '40px', background: '#0d0d1a',
        borderRadius: '16px', color: '#6b7280', border: '1px solid #1e1b4b'
    },
    historyList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    historyCard: {
        background: '#0d0d1a', borderRadius: '12px', padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'all 0.3s ease', cursor: 'pointer',
    },
    topicTitle: { margin: '0 0 4px', fontSize: '15px', fontWeight: '600', color: '#e2e8f0' },
    historyDate: { margin: 0, fontSize: '13px', color: '#4b5563' },
    scoreChip: (pct) => ({
        padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '14px',
        background: pct >= 80 ? '#052e16' : pct >= 50 ? '#1c1a00' : '#1c0a0a',
        color: pct >= 80 ? '#4ade80' : pct >= 50 ? '#facc15' : '#f87171',
        border: `1px solid ${pct >= 80 ? '#16a34a44' : pct >= 50 ? '#ca8a0444' : '#dc262644'}`,
    })
};