/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

export default function Leaderboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await API.get('/score/leaderboard');
                setLeaderboard(res.data.leaderboard);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchLeaderboard();
    }, []);

    const getRankEmoji = (rank) => {
        if (rank === 0) return '🥇';
        if (rank === 1) return '🥈';
        if (rank === 2) return '🥉';
        return `#${rank + 1}`;
    };

    const getRankColor = (rank) => {
        if (rank === 0) return { color: '#fbbf24', bg: '#1c1700', border: '#ca8a04' };
        if (rank === 1) return { color: '#9ca3af', bg: '#111827', border: '#4b5563' };
        if (rank === 2) return { color: '#c2773a', bg: '#1c0e00', border: '#92400e' };
        return { color: '#a78bfa', bg: '#0d0d1a', border: '#1e1b4b' };
    };

    return (
        <div style={styles.container}>
            {/* Navbar */}
            <div style={styles.navbar}>
                <h1 style={styles.logo}>🧠 QuizAI</h1>
                <div style={styles.navRight}>
                    <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>
                        📊 Dashboard
                    </button>
                    <button style={styles.navBtn} onClick={() => navigate('/generate')}>
                        ✨ New Quiz
                    </button>
                </div>
            </div>

            <div style={styles.content}>
                <div style={styles.header}>
                    <h2 style={styles.title}>🏆 Global Leaderboard</h2>
                    <p style={styles.subtitle}>Top performers ranked by average score</p>
                </div>

                {/* Current user rank */}
                {!loading && leaderboard.length > 0 && (
                    <div style={styles.myRankBox}>
                        {(() => {
                            const myRank = leaderboard.findIndex(u => u.username === user?.username);
                            return myRank !== -1 ? (
                                <p style={styles.myRankText}>
                                    🎯 You are ranked <strong style={{ color: '#a78bfa' }}>#{myRank + 1}</strong> out of {leaderboard.length} players!
                                </p>
                            ) : (
                                <p style={styles.myRankText}>
                                    🎯 Complete more quizzes to appear on the leaderboard!
                                </p>
                            );
                        })()}
                    </div>
                )}

                {loading ? (
                    <div style={styles.loadingBox}>
                        <p style={styles.loadingText}>⏳ Loading leaderboard...</p>
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div style={styles.emptyBox}>
                        <p style={styles.emptyText}>No scores yet! Be the first to take a quiz 🚀</p>
                        <button style={styles.generateBtn} onClick={() => navigate('/generate')}>
                            ✨ Generate First Quiz
                        </button>
                    </div>
                ) : (
                    <div style={styles.leaderboardList}>
                        {/* Header Row */}
                        <div style={styles.headerRow}>
                            <span style={styles.headerCell}>Rank</span>
                            <span style={styles.headerCell}>Player</span>
                            <span style={styles.headerCell}>Quizzes</span>
                            <span style={styles.headerCell}>Avg Score</span>
                            <span style={styles.headerCell}>Best</span>
                        </div>

                        {leaderboard.map((entry, i) => {
                            const rankStyle = getRankColor(i);
                            const isMe = entry.username === user?.username;
                            return (
                                <div
                                    key={i}
                                    style={{
                                        ...styles.row,
                                        background: isMe ? '#1a0a2e' : rankStyle.bg,
                                        border: `1px solid ${isMe ? '#7c3aed' : rankStyle.border}`,
                                        boxShadow: isMe ? '0 0 20px #7c3aed44' : 'none',
                                        transform: i < 3 ? 'scale(1.01)' : 'scale(1)'
                                    }}
                                >
                                    {/* Rank */}
                                    <span style={{
                                        ...styles.rankCell,
                                        color: rankStyle.color,
                                        fontSize: i < 3 ? '24px' : '16px'
                                    }}>
                                        {getRankEmoji(i)}
                                    </span>

                                    {/* Username */}
                                    <div style={styles.userCell}>
                                        <span style={{
                                            ...styles.username,
                                            color: isMe ? '#a78bfa' : '#e2e8f0'
                                        }}>
                                            {entry.username}
                                            {isMe && <span style={styles.youBadge}> (You)</span>}
                                        </span>
                                    </div>

                                    {/* Quizzes */}
                                    <span style={styles.dataCell}>
                                        {entry.totalQuizzes}
                                    </span>

                                    {/* Average Score */}
                                    <span style={{
                                        ...styles.scoreCell,
                                        color: entry.averageScore >= 80 ? '#4ade80' :
                                               entry.averageScore >= 60 ? '#facc15' : '#f87171'
                                    }}>
                                        {entry.averageScore}%
                                    </span>

                                    {/* Best Score */}
                                    <span style={{
                                        ...styles.scoreCell,
                                        color: '#a78bfa'
                                    }}>
                                        {entry.bestScore}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: '#0a0a0f' },
    navbar: {
        background: 'linear-gradient(90deg, #0d0d1a, #1a0a2e)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #7c3aed33'
    },
    logo: { color: '#a78bfa', margin: 0, fontSize: '24px' },
    navRight: { display: 'flex', gap: '12px' },
    navBtn: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid #7c3aed',
        background: 'transparent',
        color: '#a78bfa',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.3s ease'
    },
    content: { maxWidth: '800px', margin: '0 auto', padding: '32px 20px' },
    header: { textAlign: 'center', marginBottom: '24px' },
    title: { color: '#e2e8f0', fontSize: '28px', fontWeight: '800', margin: '0 0 8px' },
    subtitle: { color: '#6b7280', fontSize: '14px', margin: 0 },
    myRankBox: {
        background: '#1a0a2e',
        border: '1px solid #7c3aed44',
        borderRadius: '12px',
        padding: '12px 20px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    myRankText: { color: '#a78bfa', margin: 0, fontSize: '14px' },
    loadingBox: { textAlign: 'center', padding: '40px' },
    loadingText: { color: '#6b7280', fontSize: '16px' },
    emptyBox: { textAlign: 'center', padding: '40px' },
    emptyText: { color: '#6b7280', marginBottom: '16px' },
    generateBtn: {
        padding: '12px 24px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
        color: 'white',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer'
    },
    leaderboardList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    headerRow: {
        display: 'grid',
        gridTemplateColumns: '60px 1fr 80px 90px 80px',
        padding: '8px 20px',
        color: '#4b5563',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    headerCell: {},
    row: {
        display: 'grid',
        gridTemplateColumns: '60px 1fr 80px 90px 80px',
        padding: '16px 20px',
        borderRadius: '12px',
        alignItems: 'center',
        transition: 'all 0.3s ease'
    },
    rankCell: { fontWeight: '800', textAlign: 'center' },
    userCell: { display: 'flex', alignItems: 'center', gap: '10px' },
    username: { fontWeight: '600', fontSize: '15px' },
    youBadge: { fontSize: '11px', color: '#7c3aed', fontWeight: '700' },
    dataCell: { color: '#6b7280', fontSize: '14px', textAlign: 'center' },
    scoreCell: { fontWeight: '700', fontSize: '15px', textAlign: 'center' }
};