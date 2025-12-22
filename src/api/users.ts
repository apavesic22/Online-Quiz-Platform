import { Router, Request, Response } from "express";
import {db} from "../helpers/db";
import { requireRole, hashPassword } from "../helpers/auth";

export const usersRouter = Router();

usersRouter.get("/", async (req, res) => {
  try {
    if (!db.connection) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    // --- pagination params ---
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = (page - 1) * limit;

    // --- total count ---
    const totalRow = await db.connection.get<{ count: number }>(`
      SELECT COUNT(*) as count FROM USERS
    `);

    const total = totalRow?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    // --- data query with JOIN ---
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

usersRouter.post(
  "/",
  requireRole([1, 2]), 
  async (req, res) => {
    try {
      if (!db.connection) {
        return res.status(500).json({ error: "Database not initialized" });
      }

      const { username, email, password, role_id, verified } = req.body;

      // ---- validation ----
      if (!username || !password || !role_id) {
        return res.status(400).json({
          error: "Missing required fields: username, password, role_id",
        });
      }

      // ---- role existence ----
      const role = await db.connection.get(
        `SELECT role_id FROM USER_ROLES WHERE role_id = ?`,
        [role_id]
      );

      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }

      // ---- uniqueness ----
      const existing = await db.connection.get(
        `SELECT user_id FROM USERS WHERE username = ? OR email = ?`,
        [username, email ?? null]
      );

      if (existing) {
        return res.status(409).json({ error: "User already exists" });
      }

      // ---- insert ----
      await db.connection.run(
        `
        INSERT INTO USERS
          (role_id, username, email, password_hash, verified, rank, total_score)
        VALUES (?, ?, ?, ?, ?, 0, 0)
      `,
        [
          role_id,
          username,
          email ?? null,
          hashPassword(password),
          verified ? 1 : 0,
        ]
      );

      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create user" });
    }
  }
);

usersRouter.get(
  "/:username",
  requireRole([1, 2]), 
  async (req, res) => {
    try {
      if (!db.connection) {
        return res.status(500).json({ error: "Database not initialized" });
      }

      const { username } = req.params;

      const user = await db.connection.get(
        `
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
        WHERE u.username = ?
      `,
        [username]
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // In practice this will almost never happen, but included per spec
      if (Object.keys(user).length === 0) {
        return res.status(204).send();
      }

      res.status(200).json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }
);

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

