/**
 * One-command database setup:
 *   1. creates the database if it does not exist
 *   2. runs database/schema.sql   (drops and recreates all tables)
 *   3. runs database/seed.sql     (sample categories, authors, articles)
 *   4. if ADMIN_EMAIL + ADMIN_PASSWORD are set in .env, creates/updates that admin
 *
 * Usage: npm run db:setup            (asks for confirmation)
 *        npm run db:setup -- --yes   (no prompt, e.g. in CI)
 *        npm run db:setup -- --no-seed
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.resolve(__dirname, '..', '..', 'database');
const args = new Set(process.argv.slice(2));

async function confirm() {
  if (args.has('--yes') || args.has('-y')) return true;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `This will DROP and recreate all tables in "${env.db.database}" on ${env.db.host}:${env.db.port}. Continue? (y/N) `
  );
  rl.close();
  return answer.trim().toLowerCase().startsWith('y');
}

async function main() {
  if (!(await confirm())) {
    console.log('Cancelled. Nothing was changed.');
    return;
  }
  const { database, ...conn } = env.db;
  const server = await mysql.createConnection({ ...conn, multipleStatements: true });
  await server.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await server.query(`USE \`${database}\``);

  console.log('• Creating tables from database/schema.sql');
  await server.query(fs.readFileSync(path.join(DB_DIR, 'schema.sql'), 'utf8'));

  if (!args.has('--no-seed')) {
    console.log('• Loading sample data from database/seed.sql');
    await server.query(fs.readFileSync(path.join(DB_DIR, 'seed.sql'), 'utf8'));
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await server.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = 'admin'`,
      [ADMIN_NAME || 'Site Admin', ADMIN_EMAIL.toLowerCase(), hash]
    );
    console.log(`• Admin account ready: ${ADMIN_EMAIL}`);
  } else if (!args.has('--no-seed')) {
    console.log('• Default admin: admin@nationalmail.in / Admin@12345 (change this after signing in)');
  }

  await server.end();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Database setup failed:', err.message);
  if (err.code === 'ECONNREFUSED') console.error('Is MySQL running, and are DB_HOST / DB_PORT in backend/.env correct?');
  if (err.code === 'ER_ACCESS_DENIED_ERROR') console.error('Check DB_USER / DB_PASSWORD in backend/.env.');
  process.exit(1);
});
