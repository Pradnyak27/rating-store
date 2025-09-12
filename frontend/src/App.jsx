import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import pages and components
import AuthPage from './pages/AuthPage';
import NormalUserDashboard from './pages/NormalUserDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// A component to protect routes based on role
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, role } = useAuth();

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/" replace />;
    }

    if (requiredRole && role !== requiredRole) {
        // Redirect to a dashboard or a specific page if role is not matched
        // For this example, we'll redirect to the user's own dashboard
        if (role === 'System Administrator') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (role === 'Store Owner') {
            return <Navigate to="/owner/dashboard" replace />;
        }
        if (role === 'Normal User') {
            return <Navigate to="/user/dashboard" replace />;
        }
    }

    return children;
};

// Main App Component
const App = () => {
    const { isAuthenticated, role } = useAuth();

    // Conditionally render the main application content
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* The root route leads to the AuthPage if not authenticated */}
                    <Route path="/" element={isAuthenticated ? <Navigate to={
                        role === 'System Administrator' ? "/admin/dashboard" :
                        role === 'Store Owner' ? "/owner/dashboard" :
                        "/user/dashboard"
                    } replace /> : <AuthPage />} />

                    {/* Protected Routes for each dashboard */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute requiredRole="System Administrator">
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/dashboard"
                        element={
                            <ProtectedRoute requiredRole="Store Owner">
                                <StoreOwnerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/user/dashboard"
                        element={
                            <ProtectedRoute requiredRole="Normal User">
                                <NormalUserDashboard />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* Fallback for undefined routes */}
                    <Route path="*" element={<h1>404: Not Found</h1>} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;