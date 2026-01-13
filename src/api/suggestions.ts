import { Router } from "express";
import { db } from "../helpers/db";

export const suggestionsRouter = Router();

suggestionsRouter.post("/", async (req, res) => {
  try {
    if (!req.isAuthenticated())
      return res.status(401).json({ error: "Unauthorized" });

    const { title, description } = req.body;
    const user = req.user as any;
    const userId = user.user_id || user.id;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    await db.connection?.run(
      `INSERT INTO SUGGESTIONS (user_id, title, description) VALUES (?, ?, ?)`,
      [userId, title, description]
    );

    res.status(201).json({ message: "Suggestion submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit suggestion" });
  }
});

suggestionsRouter.get("/", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = req.user as any;
    // Management (2) or Admin (1) check
    const isAdminOrManagement = user.roles?.includes(1) || user.roles?.includes(2);

    if (!isAdminOrManagement) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!db.connection) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    // This query links the user_id in SUGGESTIONS to the USERS table to get the name
    const suggestions = await db.connection.all(
      `
      SELECT 
        s.suggestion_id, 
        s.user_id, 
        s.title, 
        s.description, 
        s.status,
        u.username 
      FROM SUGGESTIONS s
      JOIN USERS u ON s.user_id = u.user_id
      ORDER BY s.suggestion_id DESC
      `
    );

    res.status(200).json(suggestions);
  } catch (err) {
    console.error("Failed to fetch suggestions:", err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

suggestionsRouter.patch("/:id/status", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = req.user as any;
    const isAdminOrManagement = user.roles?.includes(2);

    if (!isAdminOrManagement) {
      return res.status(403).json({ error: "Forbidden: Management only" });
    }

    const suggestionId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    if (!db.connection) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const result = await db.connection.run(
      `UPDATE SUGGESTIONS SET status = ? WHERE suggestion_id = ?`,
      [status, suggestionId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Suggestion not found" });
    }

    res.status(200).json({ message: `Suggestion marked as ${status}` });
  } catch (err) {
    console.error("Failed to update status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});