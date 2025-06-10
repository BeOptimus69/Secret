const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load env vars
dotenv.config();

// Connect to Database
const connectDB = require('./config/db');
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser
app.use(cors());         // Enable CORS

// Define a simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running and test route is working!' });
});

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Mood routes
const moodRoutes = require('./routes/moodRoutes');
app.use('/api/moods', moodRoutes);

// Friend routes
const friendRoutes = require('./routes/friendRoutes.js');
app.use('/api/friends', friendRoutes);

// Social routes
const socialRoutes = require('./routes/socialRoutes.js');
app.use('/api/social', socialRoutes);

const PORT = process.env.PORT || 5001; // Default to 5001 if PORT not in .env

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
