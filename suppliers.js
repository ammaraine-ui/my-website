import { sql } from '@vercel/postgres';
import { initDb } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    await initDb();

    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM suppliers ORDER BY id DESC`;
      return res.status(200).json({ success: true, data: result.rows });
    }

    if (req.method === 'POST') {
      const { name, phone, address, balance } = req.body || {};
      if (!name) return res.status(400).json({ success: false, message: 'اسم المورد مطلوب' });
      const result = await sql`
        INSERT INTO suppliers (name, phone, address, balance)
        VALUES (${name}, ${phone || ''}, ${address || ''}, ${Number(balance || 0)})
        RETURNING *
      `;
      return res.status(201).json({ success: true, data: result.rows[0] });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
