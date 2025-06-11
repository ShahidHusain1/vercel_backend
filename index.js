require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db/config');
const createTables = require('./db/initTables');
const populateSeats = require('./db/populateSeats');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/seats', require('./routes/seats'));

// Initialize DB
async function initializeDatabase() {
  await createTables();
  await populateSeats();
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initializeDatabase();
});
