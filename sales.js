import { sql } from '@vercel/postgres';
import { initDb } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    await initDb();

    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM sales_invoices ORDER BY id DESC LIMIT 50`;
      return res.status(200).json({ success: true, data: result.rows });
    }

    if (req.method === 'POST') {
      const { customer_name, notes, items } = req.body || {};
      const safeItems = Array.isArray(items) ? items : [];
      if (safeItems.length === 0) {
        return res.status(400).json({ success: false, message: 'لا توجد مواد في الفاتورة' });
      }
      const total = safeItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0);

      const invoiceResult = await sql`
        INSERT INTO sales_invoices (customer_name, total, notes)
        VALUES (${customer_name || 'نقدي'}, ${total}, ${notes || ''})
        RETURNING *
      `;
      const invoice = invoiceResult.rows[0];

      for (const item of safeItems) {
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const lineTotal = quantity * price;

        await sql`
          INSERT INTO sales_invoice_items (invoice_id, item_name, quantity, price, line_total)
          VALUES (${invoice.id}, ${item.name || ''}, ${quantity}, ${price}, ${lineTotal})
        `;

        if (item.id) {
          await sql`UPDATE items SET quantity = quantity - ${quantity} WHERE id = ${Number(item.id)}`;
        } else {
          await sql`UPDATE items SET quantity = quantity - ${quantity} WHERE name = ${item.name || ''}`;
        }
      }

      return res.status(201).json({ success: true, data: invoice });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
