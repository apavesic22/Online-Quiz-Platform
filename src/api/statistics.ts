import { Router } from "express";
import { db } from "../helpers/db";

export const statsRouter = Router(); 

statsRouter.get("/my-stats", async (req, res) => {
  try {
    if (!db.connection) return res.status(500).json({ error: "Database not initialized" });
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

    const user = req.user as any;
    const userId = user.id || user.user_id;

    const personalStats = await db.connection.all(
      `
      SELECT 
        q.quiz_name,
        qa.score AS your_score,  -- Renamed for frontend consistency
        qa.finished_at,
        c.category_name,
        -- 1. Count actual correct answers from individual responses
        (SELECT COUNT(*) FROM ATTEMPT_ANSWERS WHERE attempt_id = qa.attempt_id AND is_correct = 1) as correct_answers,
        -- 2. Get total questions for this specific quiz
        (SELECT COUNT(*) FROM QUESTIONS WHERE quiz_id = q.quiz_id) as total_questions
      FROM QUIZ_ATTEMPTS qa
      JOIN QUIZZES q ON qa.quiz_id = q.quiz_id
      JOIN CATEGORIES c ON q.category_id = c.category_id
      WHERE qa.user_id = ? 
      ORDER BY qa.finished_at ASC -- Sort ASC for chronological chart flow
    `,
      [userId]
    );

    res.json(personalStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

statsRouter.get("/difficulty-stats", async (req, res) => {
  try {
    if (!db.connection) return res.status(500).json({ error: "Database not initialized" });

    const stats = await db.connection.all(
      `SELECT d.difficulty as label, COUNT(q.quiz_id) as count
       FROM QUIZ_DIFFICULTIES d
       LEFT JOIN QUIZZES q ON d.id = q.difficulty_id
       GROUP BY d.difficulty`
    );

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch difficulty stats" });
  }
});
