import { Router, Request } from "express";
import { db } from "../helpers/db";
import { User } from "../model/user";

export const quizzesRouter = Router();

quizzesRouter.get("/", async (req, res) => {
  try {
    if (!db.connection) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = (page - 1) * limit;

    const totalRow = await db.connection.get<{ count: number }>(`
      SELECT COUNT(*) AS count FROM QUIZZES
    `);

    const total = totalRow?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    if (total === 0) {
      return res.status(204).send();
    }

    // ---- paginated data ----
    const quizzes = await db.connection.all(
      `
      SELECT
        q.quiz_id,
        q.quiz_name,
        q.question_count,
        q.duration,
        q.is_customizable,
        q.created_at,

        c.category_name,
        d.difficulty,

        u.username AS creator,

        COUNT(ql.user_id) AS likes
      FROM QUIZZES q
      JOIN CATEGORIES c ON c.category_id = q.category_id
      JOIN QUIZ_DIFFICULTIES d ON d.id = q.difficulty_id
      JOIN USERS u ON u.user_id = q.user_id
      LEFT JOIN QUIZ_LIKES ql ON ql.quiz_id = q.quiz_id
      GROUP BY q.quiz_id
      ORDER BY q.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset]
    );

    res.json({
      page,
      limit,
      total,
      totalPages,
      data: quizzes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});


quizzesRouter.post("/", async (req, res) => {
  try {
    if (!db.connection) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = req.user as User;

    const {
      quiz_name,
      category_id,
      difficulty_id,
      question_count,
      duration,
    } = req.body;

    // ---- validation ----
    if (!quiz_name || !category_id || !difficulty_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ---- category exists ----
    const category = await db.connection.get(
      `SELECT category_id FROM CATEGORIES WHERE category_id = ?`,
      [category_id]
    );

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // ---- difficulty exists ----
    const difficulty = await db.connection.get(
      `SELECT id FROM QUIZ_DIFFICULTIES WHERE id = ?`,
      [difficulty_id]
    );

    if (!difficulty) {
      return res.status(404).json({ error: "Difficulty not found" });
    }

    // ---- uniqueness (same user, same name) ----
    const existing = await db.connection.get(
      `
      SELECT quiz_id
      FROM QUIZZES
      WHERE user_id = ? AND quiz_name = ?
      `,
      [user.id, quiz_name]
    );

    if (existing) {
      return res.status(409).json({ error: "Quiz already exists" });
    }

    // ---- role-based customization ----
    const isVerified = user.roles?.includes(3);

    const finalQuestionCount = isVerified && question_count
      ? question_count
      : 10;

    const finalDuration = isVerified && duration
      ? duration
      : 300;

    const isCustomizable = isVerified ? 1 : 0;

    // ---- insert quiz ----
    const result = await db.connection.run(
      `
      INSERT INTO QUIZZES
        (user_id, category_id, difficulty_id,
         quiz_name, question_count, duration, is_customizable)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user.id,
        category_id,
        difficulty_id,
        quiz_name,
        finalQuestionCount,
        finalDuration,
        isCustomizable,
      ]
    );

    res.status(201).json({
      quiz_id: result.lastID,
      message: "Quiz created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create quiz" });
  }
});

quizzesRouter.get('/:id', async (req, res) => {
  res.json({ message: 'Quizzes endpoint is under construction.' });
});

quizzesRouter.put('/:id', async (req, res) => {
  res.json({ message: 'Quizzes endpoint is under construction.' });
});

quizzesRouter.delete('/:id', async (req, res) => {
  res.json({ message: 'Quizzes endpoint is under construction.' });
});

quizzesRouter.get('/:id/leaderboard', async (req, res) => {
  res.json({ message: 'Quizzes endpoint is under construction.' });
});

quizzesRouter.post('/:id/answer', async (req, res) => {
  res.json({ message: 'Quizzes endpoint is under construction.' });
});