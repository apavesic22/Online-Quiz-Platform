import { Router, Request, Response } from "express";
import {db} from "../helpers/db";
import { requireRole } from "../helpers/auth";  

export const usersRouter = Router();

usersRouter.get("/",requireRole([1,2]) , async (req, res) => {
  try {
    if (!db.connection) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = (page - 1) * limit;

    const totalRow = await db.connection.get<{ count: number }>(`
      SELECT COUNT(*) as count FROM USERS
    `);

    const total = totalRow?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    const users = await db.connection.all(`
      SELECT
        u.user_id,
        u.username,
        u.email,
        u.verified,
        u.rank,
        u.total_score,
        r.role_id,
        r.name AS role_name
      FROM USERS u
      JOIN USER_ROLES r ON r.role_id = u.role_id
      ORDER BY u.rank ASC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: users,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
usersRouter.post('/', async (req, res) => {
  res.json({ message: 'Users endpoint is under construction.' });
});

usersRouter.get('/:username', async (req, res) => {
  res.json({ message: 'Users endpoint is under construction.' });
});

usersRouter.put('/:username', async (req, res) => {
  res.json({ message: 'Users endpoint is under construction.' });
});

usersRouter.delete('/:username', async (req, res) => {
  res.json({ message: 'Users endpoint is under construction.' });
});

usersRouter.get('/:userId/roles', async (req, res) => {
  res.json({ message: 'Users endpoint is under construction.' });
});

usersRouter.put('/:userId/roles', async (req, res) => {
  res.json({ message: 'Users endpoint is under construction.' });
});

