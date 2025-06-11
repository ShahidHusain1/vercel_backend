const jwt = require('jsonwebtoken');
const { pool } = require('../db/config');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('Authentication required');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1', 
      [decoded.id]
    );

    if (!rows[0]) throw new Error('User not found');
    req.user = rows[0];
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports = auth;