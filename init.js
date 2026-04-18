import { initDb } from '../lib/db.js';

export default async function handler(req, res) {
  try {
    await initDb();
    res.status(200).json({ success: true, message: 'تم تهيئة قاعدة البيانات' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
