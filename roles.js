import { sql } from '@vercel/postgres';
import { initDb } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    await initDb();

    if (req.method === 'GET') {
      const roles = await sql`SELECT * FROM roles ORDER BY id DESC`;
      const permissions = await sql`SELECT * FROM permissions ORDER BY module_name, action_name`;
      const map = await sql`SELECT role_name, module_name, action_name FROM role_permissions`;
      return res.status(200).json({ success: true, data: { roles: roles.rows, permissions: permissions.rows, rolePermissions: map.rows } });
    }

    if (req.method === 'POST') {
      const { role_name, description, permissions } = req.body || {};
      if (!role_name) return res.status(400).json({ success: false, message: 'اسم الدور مطلوب' });
      await sql`
        INSERT INTO roles (role_name, description)
        VALUES (${role_name}, ${description || ''})
        ON CONFLICT (role_name) DO NOTHING
      `;

      if (Array.isArray(permissions)) {
        await sql`DELETE FROM role_permissions WHERE role_name = ${role_name}`;
        for (const p of permissions) {
          await sql`
            INSERT INTO role_permissions (role_name, module_name, action_name)
            VALUES (${role_name}, ${p.module_name}, ${p.action_name})
          `;
        }
      }
      return res.status(200).json({ success: true, message: 'تم حفظ الدور والصلاحيات' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
