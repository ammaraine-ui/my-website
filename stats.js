import { sql } from '@vercel/postgres';
import { initDb } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    await initDb();

    const [customers, suppliers, items, invoices, sales, users] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM customers`,
      sql`SELECT COUNT(*)::int AS count FROM suppliers`,
      sql`SELECT COUNT(*)::int AS count FROM items`,
      sql`SELECT COUNT(*)::int AS count FROM sales_invoices`,
      sql`SELECT COALESCE(SUM(total), 0)::float AS total FROM sales_invoices`,
      sql`SELECT COUNT(*)::int AS count FROM users`
    ]);

    res.status(200).json({
      success: true,
      data: {
        customers: customers.rows[0].count,
        suppliers: suppliers.rows[0].count,
        items: items.rows[0].count,
        invoices: invoices.rows[0].count,
        salesTotal: sales.rows[0].total,
        users: users.rows[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
