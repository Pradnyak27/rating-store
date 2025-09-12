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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating,
  Alert
} from '@mui/material';

const StoreOwnerDashboard = () => {
  const { logout, user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/owner/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button variant="outlined" color="primary" onClick={logout}>
            Logout
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Store Owner Dashboard
        </Typography>
        <Button variant="outlined" color="primary" onClick={logout}>
          Logout
        </Button>
      </Box>

      {dashboardData.store ? (
        <Box mb={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            Your Store: {dashboardData.store.name}
          </Typography>
          <Typography variant="body1">
            Address: {dashboardData.store.address}
          </Typography>
          <Box display="flex" alignItems="center" mt={2}>
            <Typography variant="h6" sx={{ mr: 1 }}>
              Average Rating:
            </Typography>
            <Rating
              value={dashboardData.averageRating ? parseFloat(dashboardData.averageRating) : 0}
              readOnly
              precision={0.1}
            />
            <Typography sx={{ ml: 1, fontWeight: 'bold' }}>
              ({dashboardData.averageRating ? parseFloat(dashboardData.averageRating).toFixed(1) : 'N/A'})
            </Typography>
          </Box>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>You do not have a store assigned to your account.</Alert>
      )}

      {dashboardData.usersWhoRated?.length > 0 && (
        <>
          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 4 }}>
            Users Who Have Rated Your Store
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.usersWhoRated.map((rating, index) => (
                  <TableRow key={index}>
                    <TableCell>{rating.User.name}</TableCell>
                    <TableCell>{rating.User.email}</TableCell>
                    <TableCell align="right">
                      <Rating value={rating.value} readOnly />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {dashboardData.usersWhoRated?.length === 0 && (
        <Typography variant="body1" align="center" mt={4}>
          No users have rated your store yet.
        </Typography>
      )}
    </Container>
  );
};

export default StoreOwnerDashboard;