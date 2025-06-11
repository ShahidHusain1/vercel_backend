const { pool } = require('./config');

async function populateSeats() {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM seats');
    if (parseInt(rows[0].count) === 0) {
      let seatNumber = 1;
      const totalRows = Math.ceil(80 / 7);

      for (let row = 1; row <= totalRows; row++) {
        const seatsInRow = row === totalRows ? 3 : 7;
        for (let pos = 1; pos <= seatsInRow; pos++) {
          await pool.query(
            'INSERT INTO seats (seat_number, row_number, position_in_row) VALUES ($1, $2, $3)',
            [seatNumber, row, pos]
          );
          seatNumber++;
        }
      }
      console.log('✅ Seats initialized successfully');
    } else {
      console.log('ℹ️ Seats already initialized');
    }
  } catch (err) {
    console.error('❌ Error populating seats:', err);
  }
}

module.exports = populateSeats;
