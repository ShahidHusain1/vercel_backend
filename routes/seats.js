const express = require('express');
const router = express.Router();
const { pool } = require('../db/config');

// Get all seats
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT s.*, b.user_id, u.username 
            FROM seats s
            LEFT JOIN bookings b ON s.booking_id = b.id
            LEFT JOIN users u ON b.user_id = u.id
            ORDER BY s.seat_number
        `);
        
        // Transform data for frontend
        const seats = rows.map(row => ({
            seat_number: row.seat_number,
            row_number: row.row_number,
            position_in_row: row.position_in_row,
            is_booked: row.is_booked,
            booked_by: row.is_booked ? row.username : null
        }));
        
        res.json(seats);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset all seats (admin only)
router.post('/reset', async (req, res) => {
    try {
        // In production, you would add admin authentication here
        
        // Delete all bookings
        await pool.query('DELETE FROM bookings');
        
        // Reset all seats
        await pool.query('UPDATE seats SET is_booked = FALSE, booking_id = NULL');
        
        res.json({ message: 'All seats have been reset' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;