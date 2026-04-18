import { sql } from '@vercel/postgres';
import { initDb } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    await initDb();

    if (req.method === 'GET') {
      const result = await sql`
        SELECT id, username, full_name, role_name, is_active, created_at
        FROM users ORDER BY id DESC
      `;
      return res.status(200).json({ success: true, data: result.rows });
    }

    if (req.method === 'POST') {
      const { username, password, full_name, role_name } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'اسم المستخدم وكلمة المرور مطلوبان' });
      }
      const result = await sql`
        INSERT INTO users (username, password, full_name, role_name, is_active)
        VALUES (${username}, ${password}, ${full_name || username}, ${role_name || 'كاشير'}, true)
        RETURNING id, username, full_name, role_name, is_active, created_at
      `;
      return res.status(201).json({ success: true, data: result.rows[0] });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
