import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
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

const UserAddDialog = ({ open, onClose, onUserAdded }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [role, setRole] = useState('Normal User');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Frontend validation
        if (!validateName(name)) {
            setError('Name must be between 10 and 60 characters.');
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
            await axios.post('http://localhost:5000/api/users', { name, email, password, address, role });
            onUserAdded(); // Call the callback to refresh the user list
            onClose(); // Close the dialog
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add user. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add New User</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="dense"
                        required
                        fullWidth
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={name && !validateName(name)}
                        helperText={name && !validateName(name) && 'Name must be 20-60 characters.'}
                    />
                    <TextField
                        margin="dense"
                        required
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={email && !validateEmail(email)}
                        helperText={email && !validateEmail(email) && 'Please enter a valid email address.'}
                    />
                    <TextField
                        margin="dense"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={password && !validatePassword(password)}
                        helperText={password && !validatePassword(password) && '8-16 chars, one uppercase, one special char.'}
                    />
                    <TextField
                        margin="dense"
                        required
                        fullWidth
                        label="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        error={address && !validateAddress(address)}
                        helperText={address && !validateAddress(address) && 'Address must not exceed 400 characters.'}
                    />
                    <FormControl fullWidth margin="dense" required>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={role}
                            label="Role"
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <MenuItem value="Normal User">Normal User</MenuItem>
                            <MenuItem value="Store Owner">Store Owner</MenuItem>
                            <MenuItem value="System Administrator">System Administrator</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Add User'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserAddDialog;