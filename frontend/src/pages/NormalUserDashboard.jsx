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
  TextField,
  InputAdornment,
  Rating,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RatingDialog from '../components/RatingDialog';

const NormalUserDashboard = () => {
  const { logout, user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const fetchStores = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      // The API now returns the user's specific rating thanks to the backend update
      const response = await axios.get(`http://localhost:5000/api/stores?search=${query}`);
      setStores(response.data.stores);
    } catch (err) {
      setError('Failed to fetch stores. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    fetchStores(e.target.value);
  };

  const handleOpenDialog = (store) => {
    setSelectedStore(store);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStore(null);
  };

  const handleRatingSubmitted = () => {
    handleCloseDialog();
    fetchStores(searchQuery); // Re-fetch stores to show the updated rating
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.name || 'User'}!
        </Typography>
        <Button variant="outlined" color="primary" onClick={logout}>
          Logout
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Search Stores"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" align="center" mt={4}>{error}</Typography>
      )}

      {!loading && stores.length === 0 && !error && (
        <Typography align="center" mt={4}>No stores found.</Typography>
      )}

      {!loading && stores.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Store Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Overall Rating</TableCell>
                <TableCell align="right">Your Rating</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>{store.name}</TableCell>
                  <TableCell>{store.address}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <Rating
                        value={parseFloat(store.overallRating)}
                        readOnly
                        precision={0.1}
                      />
                      <Typography sx={{ ml: 1 }}>
                        ({store.overallRating ? parseFloat(store.overallRating).toFixed(1) : '0.0'})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {store.userRating ? (
                      <Rating value={parseFloat(store.userRating)} readOnly />
                    ) : (
                      <Typography>Not Rated</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenDialog(store)}
                    >
                      {store.userRating ? 'Edit Rating' : 'Rate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {selectedStore && (
        <RatingDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          storeId={selectedStore.id}
          currentRating={selectedStore.userRating}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </Container>
  );
};

export default NormalUserDashboard;