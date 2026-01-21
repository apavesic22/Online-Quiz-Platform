import { Router } from "express";
import { db } from "../helpers/db";
import { User } from "../model/user";
import { LeaderboardEntry } from "../model/LeaderboardEntry";

export const leaderboardRouter = Router();


leaderboardRouter.get("/global", async (req, res) => {
  try {
    if (!db.connection) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const userId = req.isAuthenticated() ? (req.user as any).user_id : null;

    const leaderboard = await db.connection.all<LeaderboardEntry[]>(
      `
      SELECT
        u.user_id,
        u.username,
        u.total_score as score,
        u.rank,
        COUNT(DISTINCT qa.quiz_id) as quizzes_completed
      FROM USERS u
      LEFT JOIN QUIZ_ATTEMPTS qa ON u.user_id = qa.user_id
      WHERE u.user_id != 4
      GROUP BY u.user_id
      ORDER BY u.total_score DESC, u.user_id ASC
      LIMIT ?
      `,
      [limit]
    );

    let currentUserStats = null;
    if (userId) {
      currentUserStats = await db.connection.get(
        `
        SELECT
          u.user_id,
          u.username,
          u.total_score as score,
          u.rank,
          COUNT(DISTINCT qa.quiz_id) as quizzes_completed
        FROM USERS u
        LEFT JOIN QUIZ_ATTEMPTS qa ON u.user_id = qa.user_id
        WHERE u.user_id = ?
        GROUP BY u.user_id
        `,
        [userId]
      );
    }

    res.status(200).json({
      type: "global",
      leaderboard,
      currentUser: currentUserStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch global leaderboard" });
  }
});


leaderboardRouter.get("/category/:categoryId", async (req, res) => {
  try {
    if (!db.connection) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const categoryId = Number(req.params.categoryId);
    if (Number.isNaN(categoryId)) {
      return res.status(400).json({ error: "Invalid category id" });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const userId = req.isAuthenticated() ? (req.user as any).user_id : null;

    const category = await db.connection.get<{
      category_id: number;
      category_name: string;
    }>(
      `SELECT category_id, category_name FROM CATEGORIES WHERE category_id = ?`,
      [categoryId]
    );

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const leaderboard = await db.connection.all(
      `
      SELECT
        u.user_id,
        u.username,
        SUM(qa.score) as score,
        COUNT(qa.attempt_id) as quizzes_completed,
        ROW_NUMBER() OVER (ORDER BY SUM(qa.score) DESC, MIN(qa.finished_at) ASC) as rank
      FROM USERS u
      JOIN QUIZ_ATTEMPTS qa ON u.user_id = qa.user_id
      JOIN QUIZZES q ON qa.quiz_id = q.quiz_id
      WHERE q.category_id = ? AND u.user_id != 4
      GROUP BY u.user_id
      ORDER BY score DESC, MIN(qa.finished_at) ASC
      LIMIT ?
      `,
      [categoryId, limit]
    );

    let currentUserStats = null;
    if (userId) {
      const allUsers = await db.connection.all(
        `
        SELECT
          u.user_id,
          u.username,
          SUM(qa.score) as score,
          COUNT(qa.attempt_id) as quizzes_completed,
          ROW_NUMBER() OVER (ORDER BY SUM(qa.score) DESC, MIN(qa.finished_at) ASC) as rank
        FROM USERS u
        JOIN QUIZ_ATTEMPTS qa ON u.user_id = qa.user_id
        JOIN QUIZZES q ON qa.quiz_id = q.quiz_id
        WHERE q.category_id = ?
        GROUP BY u.user_id
        ORDER BY score DESC, MIN(qa.finished_at) ASC
        `,
        [categoryId]
      );

      currentUserStats = allUsers.find((entry: any) => entry.user_id === userId);
    }

    res.status(200).json({
      type: "category",
      category_id: categoryId,
      category_name: category.category_name,
      leaderboard,
      currentUser: currentUserStats && currentUserStats.rank > limit ? currentUserStats : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch category leaderboard" });
  }
});

leaderboardRouter.get("/quiz/:quizId", async (req, res) => {
  try {
    if (!db.connection) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const quizId = Number(req.params.quizId);
    if (Number.isNaN(quizId)) {
      return res.status(400).json({ error: "Invalid quiz id" });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const userId = req.isAuthenticated() ? (req.user as any).user_id : null;

    const quiz = await db.connection.get<{
      quiz_id: number;
      quiz_name: string;
    }>(`SELECT quiz_id, quiz_name FROM QUIZZES WHERE quiz_id = ?`, [quizId]);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const allAttempts = await db.connection.all(
      `
      SELECT
        u.user_id,
        u.username,
        qa.score,
        qa.finished_at,
        ROW_NUMBER() OVER (
          ORDER BY qa.score DESC, qa.finished_at ASC
        ) AS rank
      FROM QUIZ_ATTEMPTS qa
      JOIN USERS u ON u.user_id = qa.user_id
      WHERE qa.quiz_id = ? AND u.user_id != 4
      ORDER BY qa.score DESC, qa.finished_at ASC
      `,
      [quizId]
    );

    if (allAttempts.length === 0) {
      return res.status(200).json({
        type: "quiz",
        quiz_id: quizId,
        quiz_name: quiz.quiz_name,
        leaderboard: [],
        currentUser: null,
      });
    }

    const top = allAttempts.slice(0, limit);

    let currentUserEntry = null;
    if (userId) {
      currentUserEntry = allAttempts.find(
        (entry: any) => entry.user_id === userId
      );
    }

    res.status(200).json({
      type: "quiz",
      quiz_id: quizId,
      quiz_name: quiz.quiz_name,
      leaderboard: top,
      currentUser: currentUserEntry && currentUserEntry.rank > limit ? currentUserEntry : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch quiz leaderboard" });
  }
});


leaderboardRouter.get("/categories", async (req, res) => {
  try {
    if (!db.connection) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const userId = req.isAuthenticated() ? (req.user as any).user_id : null;

    const categories = await db.connection.all<
      { category_id: number; category_name: string }[]
    >(`SELECT category_id, category_name FROM CATEGORIES ORDER BY category_name ASC`);

    const result = [];

    for (const category of categories) {
      const topUsers = await db.connection.all(
        `
        SELECT
          u.user_id,
          u.username,
          SUM(qa.score) as score,
          COUNT(qa.attempt_id) as quizzes_completed
        FROM USERS u
        JOIN QUIZ_ATTEMPTS qa ON u.user_id = qa.user_id
        JOIN QUIZZES q ON qa.quiz_id = q.quiz_id
        WHERE q.category_id = ? AND u.user_id != 4
        GROUP BY u.user_id
        ORDER BY score DESC
        LIMIT 3
        `,
        [category.category_id]
      );

      let userRank = null;
      if (userId) {
        const allUsers = await db.connection.all(
          `
          SELECT
            u.user_id,
            SUM(qa.score) as score,
            ROW_NUMBER() OVER (ORDER BY SUM(qa.score) DESC) as rank
          FROM USERS u
          JOIN QUIZ_ATTEMPTS qa ON u.user_id = qa.user_id
          JOIN QUIZZES q ON qa.quiz_id = q.quiz_id
          WHERE q.category_id = ?
          GROUP BY u.user_id
          `,
          [category.category_id]
        );

        const userEntry = allUsers.find((entry: any) => entry.user_id === userId);
        if (userEntry) {
          userRank = {
            rank: userEntry.rank,
            score: userEntry.score,
          };
        }
      }

      result.push({
        category_id: category.category_id,
        category_name: category.category_name,
        top_users: topUsers,
        user_rank: userRank,
      });
    }

    res.status(200).json({
      categories: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch category leaderboards" });
  }
});


leaderboardRouter.get("/user/:userId", async (req, res) => {
  try {
    if (!db.connection) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const targetUserId = Number(req.params.userId);
    if (Number.isNaN(targetUserId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const user = await db.connection.get<{
      user_id: number;
      username: string;
      total_score: number;
      rank: number;
    }>(
      `SELECT user_id, username, total_score, rank FROM USERS WHERE user_id = ?`,
      [targetUserId]
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const categoryStats = await db.connection.all(
      `
      SELECT
        c.category_id,
        c.category_name,
        SUM(qa.score) as total_score,
        COUNT(qa.attempt_id) as quizzes_completed,
        AVG(qa.score) as avg_score,
        MAX(qa.score) as best_score
      FROM CATEGORIES c
      LEFT JOIN QUIZZES q ON c.category_id = q.category_id
      LEFT JOIN QUIZ_ATTEMPTS qa ON q.quiz_id = qa.quiz_id AND qa.user_id = ?
      GROUP BY c.category_id
      ORDER BY total_score DESC
      `,
      [targetUserId]
    );

    const recentAttempts = await db.connection.all(
      `
      SELECT
        q.quiz_id,
        q.quiz_name,
        c.category_name,
        qa.score,
        qa.finished_at
      FROM QUIZ_ATTEMPTS qa
      JOIN QUIZZES q ON qa.quiz_id = q.quiz_id
      JOIN CATEGORIES c ON q.category_id = c.category_id
      WHERE qa.user_id = ?
      ORDER BY qa.finished_at DESC
      LIMIT 10
      `,
      [targetUserId]
    );

    res.status(200).json({
      user: {
        user_id: user.user_id,
        username: user.username,
        total_score: user.total_score,
        global_rank: user.rank,
      },
      category_stats: categoryStats,
      recent_attempts: recentAttempts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user leaderboard data" });
  }
});