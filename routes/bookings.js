const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db/config');
const { findBestSeats } = require('../utils/seatAllocation.js');

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { seatNumbers } = req.body;
    
    if (!seatNumbers?.length || seatNumbers.length > 7) {
      return res.status(400).json({ error: 'Select 1-7 seats' });
    }

    // Check seat availability
    const { rows } = await pool.query(
      `SELECT seat_number FROM seats 
       WHERE seat_number = ANY($1) AND is_booked = TRUE`,
      [seatNumbers]
    );
    
    if (rows.length > 0) {
      return res.status(400).json({ 
        error: 'Some seats are already booked',
        bookedSeats: rows.map(s => s.seat_number)
      });
    }

    // Create booking
    const booking = await pool.query(
      `INSERT INTO bookings (user_id, seat_numbers) 
       VALUES ($1, $2) RETURNING *`,
      [req.user.id, seatNumbers]
    );

    // Mark seats as booked
    await pool.query(
      `UPDATE seats SET is_booked = TRUE, booking_id = $1 
       WHERE seat_number = ANY($2)`,
      [booking.rows[0].id, seatNumbers]
    );

    res.status(201).json(booking.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Booking failed' });
  }
});

// Get user bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, seat_numbers, booking_time 
       FROM bookings WHERE user_id = $1 ORDER BY booking_time DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    // Verify booking belongs to user
    const booking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    // Free up seats
    await pool.query(
      'UPDATE seats SET is_booked = FALSE, booking_id = NULL WHERE booking_id = $1',
      [req.params.id]
    );

    // Delete booking
    await pool.query(
      'DELETE FROM bookings WHERE id = $1',
      [req.params.id]
    );

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});



module.exports = router;
