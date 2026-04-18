import { sql } from '@vercel/postgres';
import { initDb } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    await initDb();
    const { username, password } = req.body || {};
    const result = await sql`
      SELECT id, username, full_name, role_name
      FROM users
      WHERE username = ${username} AND password = ${password}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }

    res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
