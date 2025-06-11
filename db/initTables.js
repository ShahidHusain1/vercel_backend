const { pool } = require('./config');

async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS seats (
        seat_number INTEGER PRIMARY KEY,
        row_number INTEGER NOT NULL,
        position_in_row INTEGER NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_seats (
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        seat_number INTEGER REFERENCES seats(seat_number) ON DELETE CASCADE,
        PRIMARY KEY (booking_id, seat_number)
      );
    `);

    console.log('✅ Tables created or already exist.');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
  }
}

module.exports = createTables;
