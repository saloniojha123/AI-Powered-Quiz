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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            {/* Navbar */}
            <div style={styles.navbar}>
                <h1 style={styles.logo}>🧠 QuizAI</h1>
                <div style={styles.navRight}>
                    <span style={styles.welcome}>Hi, {user?.username}! 👋</span>
                    <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div style={styles.content}>
                {/* Stats Cards */}
                {loading ? (
                    <p style={styles.loading}>Loading your stats...</p>
                ) : (
                    <>
                        <div style={styles.statsGrid}>
                            <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                                <h3 style={styles.statNumber}>{stats?.totalQuizzes || 0}</h3>
                                <p style={styles.statLabel}>Total Quizzes</p>
                            </div>
                            <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
                                <h3 style={styles.statNumber}>{stats?.averageScore || '0%'}</h3>
                                <p style={styles.statLabel}>Average Score</p>
                            </div>
                            <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
                                <h3 style={styles.statNumber}>{stats?.bestScore || '0%'}</h3>
                                <p style={styles.statLabel}>Best Score</p>
                            </div>
                            <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>
                                <h3 style={styles.statNumber}>🏆</h3>
                                <p style={styles.statLabel}>{stats?.bestTopic || 'No topic yet'}</p>
                            </div>
                        </div>

                        {/* Generate Quiz Button */}
                        <button style={styles.generateBtn} onClick={() => navigate('/generate')}>
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
                                {history.map((item) => (
                                    <div key={item.id} style={styles.historyCard}>
                                        <div>
                                            <h3 style={styles.topicTitle}>{item.topicTitle}</h3>
                                            <p style={styles.historyDate}>
                                                {new Date(item.date).toLocaleDateString()}
                                            </p>
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
    container: { minHeight: '100vh', background: '#f5f7ff' },
    navbar: {
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        padding: '16px 32px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center'
    },
    logo: { color: 'white', margin: 0, fontSize: '24px' },
    navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    welcome: { color: 'white', fontSize: '15px' },
    logoutBtn: {
        padding: '8px 16px', borderRadius: '8px', border: '2px solid white',
        background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '14px'
    },
    content: { maxWidth: '900px', margin: '0 auto', padding: '32px 20px' },
    loading: { textAlign: 'center', color: '#888', fontSize: '16px' },
    statsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '32px'
    },
    statCard: {
        borderRadius: '16px', padding: '24px', textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
    },
    statNumber: { color: 'white', fontSize: '32px', margin: '0 0 8px', fontWeight: '700' },
    statLabel: { color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '14px' },
    generateBtn: {
        width: '100%', padding: '18px', borderRadius: '14px', border: 'none',
        background: 'linear-gradient(135deg, #667eea, #f093fb)',
        color: 'white', fontSize: '18px', fontWeight: '700',
        cursor: 'pointer', marginBottom: '32px',
        boxShadow: '0 8px 24px rgba(102,126,234,0.4)'
    },
    sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#333', marginBottom: '16px' },
    emptyState: {
        textAlign: 'center', padding: '40px', background: 'white',
        borderRadius: '16px', color: '#888'
    },
    historyList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    historyCard: {
        background: 'white', borderRadius: '12px', padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    topicTitle: { margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#333' },
    historyDate: { margin: 0, fontSize: '13px', color: '#888' },
    scoreChip: (pct) => ({
        padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '14px',
        background: pct >= 80 ? '#e8f5e9' : pct >= 50 ? '#fff8e1' : '#fce4ec',
        color: pct >= 80 ? '#2e7d32' : pct >= 50 ? '#f57f17' : '#c62828'
    })
};