import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await API.post('/auth/login', form);
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.logo}>🧠 QuizAI</h1>
                <h2 style={styles.title}>Welcome Back!</h2>
                <p style={styles.subtitle}>Login to continue your learning journey</p>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input}
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        required
                    />
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        required
                    />
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={styles.link}>
                    Don't have an account? <Link to="/register" style={styles.linkText}>Register</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    card: {
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        textAlign: 'center'
    },
    logo: { fontSize: '40px', marginBottom: '10px' },
    title: { fontSize: '24px', fontWeight: '700', color: '#333', margin: '0 0 8px' },
    subtitle: { color: '#888', marginBottom: '24px', fontSize: '14px' },
    error: {
        background: '#ffe0e0', color: '#c00', padding: '10px',
        borderRadius: '8px', marginBottom: '16px', fontSize: '14px'
    },
    input: {
        width: '100%', padding: '12px 16px', marginBottom: '12px',
        borderRadius: '10px', border: '1px solid #ddd', fontSize: '15px',
        boxSizing: 'border-box', outline: 'none'
    },
    button: {
        width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white', fontSize: '16px', fontWeight: '600',
        cursor: 'pointer', marginTop: '8px'
    },
    link: { marginTop: '20px', color: '#888', fontSize: '14px' },
    linkText: { color: '#667eea', fontWeight: '600', textDecoration: 'none' }
};