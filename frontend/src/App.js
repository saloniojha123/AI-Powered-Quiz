import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GenerateQuiz from './pages/GenerateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import Results from './pages/Results';

const PrivateRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/generate" element={<PrivateRoute><GenerateQuiz /></PrivateRoute>} />
            <Route path="/quiz/:id" element={<PrivateRoute><TakeQuiz /></PrivateRoute>} />
            <Route path="/results" element={<PrivateRoute><Results /></PrivateRoute>} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}