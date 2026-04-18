import { sql } from '@vercel/postgres';
import { initDb } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    await initDb();

    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM customers ORDER BY id DESC`;
      return res.status(200).json({ success: true, data: result.rows });
    }

    if (req.method === 'POST') {
      const { name, phone, address, balance } = req.body || {};
      const result = await sql`
        INSERT INTO customers (name, phone, address, balance)
        VALUES (${name}, ${phone || ''}, ${address || ''}, ${Number(balance || 0)})
        RETURNING *
      `;
      return res.status(201).json({ success: true, data: result.rows[0] });
    }

    res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
