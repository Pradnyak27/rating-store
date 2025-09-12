const express = require('express');
const cors = require('cors');
const { syncDatabase } = require('./db');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies and handle CORS
app.use(cors());
app.use(express.json());

// --- API Routes ---
// The correct way to mount your API router.
// This single line replaces all your app.post() and app.get() calls below.
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Basic root route for a health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server and synchronize the database
async function startServer() {
  await syncDatabase(); // This is the crucial step that creates/updates your tables
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
