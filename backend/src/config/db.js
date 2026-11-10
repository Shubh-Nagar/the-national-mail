import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  timezone: 'Z', // all DATETIME values are stored and read as UTC
  supportBigNumbers: true,
});

// Make NOW()/CURRENT_TIMESTAMP use UTC in every pooled connection.
pool.pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

/** Run a query on the pool and return rows. */
export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/** Run `fn(conn)` inside a transaction; commits on success, rolls back on error. */
export async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
