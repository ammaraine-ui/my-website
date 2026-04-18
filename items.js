import { sql } from '@vercel/postgres';
import { initDb } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    await initDb();

    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM items ORDER BY id DESC`;
      return res.status(200).json({ success: true, data: result.rows });
    }

    if (req.method === 'POST') {
      const { code, name, unit_name, price, quantity } = req.body || {};
      const result = await sql`
        INSERT INTO items (code, name, unit_name, price, quantity)
        VALUES (${code || ''}, ${name}, ${unit_name || 'قطعة'}, ${Number(price || 0)}, ${Number(quantity || 0)})
        RETURNING *
      `;
      return res.status(201).json({ success: true, data: result.rows[0] });
    }

    res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
