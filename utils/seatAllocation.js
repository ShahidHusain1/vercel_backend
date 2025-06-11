const { pool } = require('../db/config');

async function findBestSeats(seatCount) {
  // 1. Try to find seats in the same row
  const { rows } = await pool.query(
    `SELECT row_number, array_agg(seat_number) as available_seats
     FROM seats WHERE is_booked = FALSE
     GROUP BY row_number
     HAVING COUNT(*) >= $1
     ORDER BY row_number
     LIMIT 1`,
    [seatCount]
  );

  if (rows.length > 0) {
    return rows[0].available_seats.slice(0, seatCount);
  }

  // 2. Find closest available seats
  return findClosestSeats(seatCount);
}

async function findClosestSeats(seatCount) {
  const { rows } = await pool.query(
    `SELECT seat_number, row_number, position_in_row
     FROM seats WHERE is_booked = FALSE
     ORDER BY seat_number`
  );

  if (rows.length < seatCount) {
    throw new Error('Not enough seats available');
  }

  let bestGroup = [];
  let minDistance = Infinity;

  for (let i = 0; i <= rows.length - seatCount; i++) {
    const group = rows.slice(i, i + seatCount);
    const distance = calculateGroupDistance(group);
    
    if (distance < minDistance) {
      minDistance = distance;
      bestGroup = group;
    }
  }

  return bestGroup.map(seat => seat.seat_number);
}

function calculateGroupDistance(group) {
  let distance = 0;
  for (let i = 1; i < group.length; i++) {
    const rowDiff = Math.abs(group[i].row_number - group[i-1].row_number) * 10;
    const posDiff = Math.abs(group[i].position_in_row - group[i-1].position_in_row);
    distance += rowDiff + posDiff;
  }
  return distance;
}

module.exports = { findBestSeats };