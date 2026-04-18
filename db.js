import { sql } from '@vercel/postgres';

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      full_name VARCHAR(150),
      role_name VARCHAR(100) DEFAULT 'مدير',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;



  await sql`
    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      phone VARCHAR(50),
      address TEXT,
      balance NUMERIC(12,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      role_name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS permissions (
      id SERIAL PRIMARY KEY,
      module_name VARCHAR(100) NOT NULL,
      action_name VARCHAR(100) NOT NULL,
      UNIQUE(module_name, action_name)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS role_permissions (
      id SERIAL PRIMARY KEY,
      role_name VARCHAR(100) NOT NULL,
      module_name VARCHAR(100) NOT NULL,
      action_name VARCHAR(100) NOT NULL,
      UNIQUE(role_name, module_name, action_name)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      phone VARCHAR(50),
      address TEXT,
      balance NUMERIC(12,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      code VARCHAR(100) UNIQUE,
      name VARCHAR(150) NOT NULL,
      unit_name VARCHAR(50) DEFAULT 'قطعة',
      price NUMERIC(12,2) DEFAULT 0,
      quantity NUMERIC(12,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sales_invoices (
      id SERIAL PRIMARY KEY,
      customer_name VARCHAR(150),
      total NUMERIC(12,2) DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sales_invoice_items (
      id SERIAL PRIMARY KEY,
      invoice_id INT REFERENCES sales_invoices(id) ON DELETE CASCADE,
      item_name VARCHAR(150),
      quantity NUMERIC(12,2) DEFAULT 1,
      price NUMERIC(12,2) DEFAULT 0,
      line_total NUMERIC(12,2) DEFAULT 0
    );
  `;



  const roles = ['Admin', 'كاشير', 'محاسب', 'امين مخزن'];
  for (const role of roles) {
    await sql`INSERT INTO roles (role_name, description) VALUES (${role}, ${role}) ON CONFLICT (role_name) DO NOTHING`;
  }

  const defaultPermissions = [
    ['dashboard','view'], ['customers','view'], ['customers','create'],
    ['suppliers','view'], ['suppliers','create'], ['items','view'], ['items','create'],
    ['sales','view'], ['sales','create'], ['reports','view'], ['users','view'], ['users','create'],
    ['roles','view'], ['roles','manage']
  ];

  for (const [module_name, action_name] of defaultPermissions) {
    await sql`INSERT INTO permissions (module_name, action_name) VALUES (${module_name}, ${action_name}) ON CONFLICT (module_name, action_name) DO NOTHING`;
  }

  for (const [module_name, action_name] of defaultPermissions) {
    await sql`INSERT INTO role_permissions (role_name, module_name, action_name) VALUES ('Admin', ${module_name}, ${action_name}) ON CONFLICT (role_name, module_name, action_name) DO NOTHING`;
  }


  const users = await sql`SELECT COUNT(*)::int AS count FROM users`;
  if (users.rows[0].count === 0) {
    await sql`
      INSERT INTO users (username, password, full_name, role_name)
      VALUES ('admin', '123456', 'مدير النظام', 'Admin')
    `;
  }
}
