import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

// Validation functions based on project requirements
const validateName = (name) => {
  return name.length >= 10 && name.length <= 60;
};

const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isCorrectLength = password.length >= 8 && password.length <= 16;
  return hasUpperCase && hasSpecialChar && isCorrectLength;
};

const validateAddress = (address) => {
  return address.length <= 400;
};

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Frontend validation
    if (!validateName(name)) {
      setError('Name must be between 20 and 60 characters.');
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be 8-16 characters long and include an uppercase letter and a special character.');
      setLoading(false);
      return;
    }
    if (!validateAddress(address)) {
      setError('Address must not exceed 400 characters.');
      setLoading(false);
      return;
    }

    try {
      // The backend will automatically set the role to 'Normal User'
      await axios.post('http://localhost:5000/api/signup', { name, email, password, address });
      setSuccess('Signup successful! Redirecting to login...');
      // Automatically log the user in after successful signup
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ mt: 1, width: '100%' }}
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Full Name"
        name="name"
        autoComplete="name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={name && !validateName(name)}
        helperText={name && !validateName(name) && 'Name must be 10-60 characters.'}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={email && !validateEmail(email)}
        helperText={email && !validateEmail(email) && 'Please enter a valid email address.'}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={password && !validatePassword(password)}
        helperText={password && !validatePassword(password) && '8-16 chars, one uppercase, one special char.'}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="address"
        label="Address"
        id="address"
        autoComplete="address-line1"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        error={address && !validateAddress(address)}
        helperText={address && !validateAddress(address) && 'Address must not exceed 400 characters.'}
      />
      <Box sx={{ position: 'relative' }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
        </Button>
      </Box>
    </Box>
  );
};

export default SignupForm;