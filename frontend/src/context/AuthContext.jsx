/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context
const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
    // State to hold user data and token
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [role, setRole] = useState(localStorage.getItem('role'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

    // Use effect to handle token changes and update state
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            setIsAuthenticated(true);
            // Set the Authorization header for all future axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            setIsAuthenticated(false);
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token, role]);

    // Function to handle user login
    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/login', { email, password });
            const { token: newToken, user: userData } = response.data;
            setToken(newToken);
            setRole(userData.role);
            setUser(userData);
            return response.data;
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    // Function to handle user logout
    const logout = () => {
        setToken(null);
        setRole(null);
        setUser(null);
    };

    // Context value to be provided to children components
    const value = {
        user,
        token,
        role,
        isAuthenticated,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};