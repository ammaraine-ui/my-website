import { sql } from '@vercel/postgres';
import { initDb } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    await initDb();

    const topItems = await sql`
      SELECT item_name, COALESCE(SUM(quantity),0)::float AS qty, COALESCE(SUM(line_total),0)::float AS total
      FROM sales_invoice_items
      GROUP BY item_name
      ORDER BY total DESC, qty DESC
      LIMIT 10
    `;

    const recentInvoices = await sql`
      SELECT id, customer_name, total, created_at
      FROM sales_invoices
      ORDER BY id DESC
      LIMIT 10
    `;

    const lowStock = await sql`
      SELECT id, code, name, quantity, price
      FROM items
      WHERE quantity <= 5
      ORDER BY quantity ASC, id DESC
      LIMIT 20
    `;

    const dailySales = await sql`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS day, COALESCE(SUM(total),0)::float AS total
      FROM sales_invoices
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY day DESC
      LIMIT 7
    `;

    return res.status(200).json({
      success: true,
      data: {
        topItems: topItems.rows,
        recentInvoices: recentInvoices.rows,
        lowStock: lowStock.rows,
        dailySales: dailySales.rows.reverse()
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
