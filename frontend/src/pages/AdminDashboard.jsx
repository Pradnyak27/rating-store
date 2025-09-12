/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Container,
    Typography,
    Button,
    Box,
    CircularProgress,
    Paper,
    Grid,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    Alert,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import UserAddDialog from '../components/UserAddDialog';
import StoreAddDialog from '../components/StoreAddDialog';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const [view, setView] = useState('summary'); // 'summary', 'users', 'stores'
    const [summaryData, setSummaryData] = useState(null);
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState({ key: 'id', order: 'asc' });

    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [storeDialogOpen, setStoreDialogOpen] = useState(false);

    const fetchSummaryData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/admin/dashboard');
            setSummaryData(response.data);
        } catch (err) {
            setError('Failed to fetch summary data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (query = '', sortBy = sort.key, sortOrder = sort.order) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/users?filter=${query}&sort=${sortBy}&order=${sortOrder}`);
            setUsers(response.data.users);
        } catch (err) {
            setError('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStores = async (query = '', sortBy = sort.key, sortOrder = sort.order) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/stores?search=${query}&sort=${sortBy}&order=${sortOrder}`);
            setStores(response.data.stores);
        } catch (err) {
            setError('Failed to fetch stores.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'summary') {
            fetchSummaryData();
        } else if (view === 'users') {
            fetchUsers(searchQuery);
        } else if (view === 'stores') {
            fetchStores(searchQuery);
        }
    }, [view, sort]);

    const handleTabChange = (event, newView) => {
        setView(newView);
        setSearchQuery(''); // Reset search when switching views
        setError(null);
        setSort({ key: 'id', order: 'asc' }); // Reset sort
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        if (view === 'users') {
            fetchUsers(e.target.value);
        } else if (view === 'stores') {
            fetchStores(e.target.value);
        }
    };

    const handleRequestSort = (property) => {
        const isAsc = sort.key === property && sort.order === 'asc';
        setSort({ key: property, order: isAsc ? 'desc' : 'asc' });
        if (view === 'users') {
            fetchUsers(searchQuery, property, isAsc ? 'desc' : 'asc');
        } else if (view === 'stores') {
            fetchStores(searchQuery, property, isAsc ? 'desc' : 'asc');
        }
    };

    const renderSummary = () => (
        <Grid container spacing={3} mt={2}>
            <Grid item xs={12} sm={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" color="text.secondary">Total Users</Typography>
                        <Typography variant="h3">{summaryData.totalUsers}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" color="text.secondary">Total Stores</Typography>
                        <Typography variant="h3">{summaryData.totalStores}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" color="text.secondary">Total Ratings</Typography>
                        <Typography variant="h3">{summaryData.totalRatings}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderUsers = () => (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" my={3}>
                <TextField
                    label="Search Users"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={handleSearch}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                />
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setUserDialogOpen(true)}>
                    Add New User
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel active={sort.key === 'name'} direction={sort.order} onClick={() => handleRequestSort('name')}>
                                    Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel active={sort.key === 'email'} direction={sort.order} onClick={() => handleRequestSort('email')}>
                                    Email
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel active={sort.key === 'address'} direction={sort.order} onClick={() => handleRequestSort('address')}>
                                    Address
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel active={sort.key === 'role'} direction={sort.order} onClick={() => handleRequestSort('role')}>
                                    Role
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length > 0 ? users.map((u) => (
                            <TableRow key={u.id}>
                                <TableCell>{u.name}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.address}</TableCell>
                                <TableCell>{u.role}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={4} align="center">No users found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <UserAddDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} onUserAdded={() => fetchUsers(searchQuery)} />
        </>
    );

    const renderStores = () => (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" my={3}>
                <TextField
                    label="Search Stores"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={handleSearch}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                />
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setStoreDialogOpen(true)}>
                    Add New Store
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel active={sort.key === 'name'} direction={sort.order} onClick={() => handleRequestSort('name')}>
                                    Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel active={sort.key === 'address'} direction={sort.order} onClick={() => handleRequestSort('address')}>
                                    Address
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">Overall Rating</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stores.length > 0 ? stores.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>{s.address}</TableCell>
                                <TableCell align="right">{s.overallRating ? parseFloat(s.overallRating).toFixed(1) : 'N/A'}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={3} align="center">No stores found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <StoreAddDialog open={storeDialogOpen} onClose={() => setStoreDialogOpen(false)} onStoreAdded={() => fetchStores(searchQuery)} />
        </>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Admin Dashboard
                </Typography>
                <Button variant="outlined" color="primary" onClick={logout}>
                    Logout
                </Button>
            </Box>

            <Tabs value={view} onChange={handleTabChange} centered>
                <Tab label="Summary" value="summary" />
                <Tab label="Users" value="users" />
                <Tab label="Stores" value="stores" />
            </Tabs>

            <Box mt={3}>
                {loading && (
                    <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
                )}
                {error && <Alert severity="error">{error}</Alert>}
                
                {!loading && !error && (
                    <>
                        {view === 'summary' && renderSummary()}
                        {view === 'users' && renderUsers()}
                        {view === 'stores' && renderStores()}
                    </>
                )}
            </Box>
        </Container>
    );
};

export default AdminDashboard;