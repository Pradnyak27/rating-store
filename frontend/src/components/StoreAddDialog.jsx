import React, { useState, useEffect } from 'react';
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

// Validation functions
const validateName = (name) => {
    return name.length >= 2 && name.length <= 60;
};

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateAddress = (address) => {
    return address.length <= 400;
};

const StoreAddDialog = ({ open, onClose, onStoreAdded }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [storeOwnerId, setStoreOwnerId] = useState('');
    const [storeOwners, setStoreOwners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingOwners, setLoadingOwners] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStoreOwners = async () => {
            setLoadingOwners(true);
            setError(null);
            try {
                // Get the token from local storage
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found. Please log in as an administrator.');
                    setLoadingOwners(false);
                    return;
                }
                // Fetch users who are store owners by sending the token in the headers
                const response = await axios.get(
                    'http://localhost:5000/api/users/store-owners',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setStoreOwners(response.data.users);
            } catch (err) {
                console.error("Failed to fetch store owners:", err);
                setError(err.response?.data?.message || 'Failed to load store owners. Please ensure you are logged in as an administrator.');
            } finally {
                setLoadingOwners(false);
            }
        };

        if (open) {
            fetchStoreOwners();
        }
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Frontend validation
        if (!validateName(name) || !validateEmail(email) || !validateAddress(address) || !storeOwnerId) {
            setError('Please check all fields and ensure they are filled correctly.');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication token not found. Please log in.');
            setLoading(false);
            return;
        }

        try {
            await axios.post(
                'http://localhost:5000/api/stores',
                { name, email, address, storeOwnerId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            onStoreAdded();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add store. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add New Store</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="dense"
                        required
                        fullWidth
                        label="Store Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={name && !validateName(name)}
                        helperText={name && !validateName(name) && 'Name must be 2-60 characters.'}
                    />
                    <TextField
                        margin="dense"
                        required
                        fullWidth
                        label="Store Email"
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
                        label="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        error={address && !validateAddress(address)}
                        helperText={address && !validateAddress(address) && 'Address must not exceed 400 characters.'}
                    />
                    <FormControl fullWidth margin="dense" required>
                        <InputLabel>Store Owner</InputLabel>
                        <Select
                            value={storeOwnerId}
                            label="Store Owner"
                            onChange={(e) => setStoreOwnerId(e.target.value)}
                            disabled={loadingOwners || storeOwners.length === 0}
                        >
                            {loadingOwners ? (
                                <MenuItem disabled>
                                    <CircularProgress size={20} />
                                    <span style={{ marginLeft: 10 }}>Loading owners...</span>
                                </MenuItem>
                            ) : (
                                storeOwners.map((owner) => (
                                    <MenuItem key={owner.id} value={owner.id}>{owner.name} ({owner.email})</MenuItem>
                                ))
                            )}
                        </Select>
                        {storeOwners.length === 0 && !loadingOwners && (
                            <Alert severity="warning" sx={{ mt: 1 }}>No store owners found. Please create one first.</Alert>
                        )}
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading || storeOwners.length === 0}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Store'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StoreAddDialog;
