import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

const RatingDialog = ({ open, onClose, storeId, currentRating, onRatingSubmitted }) => {
  const [ratingValue, setRatingValue] = useState(currentRating || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setRatingValue(currentRating || 0);
  }, [currentRating]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (currentRating) {
        // Update existing rating
        await axios.put(`http://localhost:5000/api/ratings/${storeId}`, { value: ratingValue });
      } else {
        // Submit a new rating
        await axios.post('http://localhost:5000/api/ratings', { storeId, value: ratingValue });
      }
      onRatingSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{currentRating ? 'Update Your Rating' : 'Submit a Rating'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box display="flex" flexDirection="column" alignItems="center" my={2}>
          <Typography component="legend">Your Rating (1-5)</Typography>
          <Rating
            name="simple-controlled"
            value={ratingValue}
            onChange={(event, newValue) => {
              setRatingValue(newValue);
            }}
            size="large"
            sx={{ mt: 1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading || ratingValue === 0}>
          {loading ? <CircularProgress size={24} color="inherit" /> : (currentRating ? 'Update' : 'Submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingDialog;