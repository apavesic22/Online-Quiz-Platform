import express from "express";
import morgan from "morgan";
import { config } from "dotenv";
import path from "path";
import { errorHandler } from "./helpers/errors";
import { openDb } from "./helpers/db";
import { authRouter, initAuth } from "./helpers/auth";
import { usersRouter } from "./api/users";
import { quizzesRouter } from "./api/quizzes";
import { categoriesRouter } from "./api/categories";
import { suggestionsRouter } from "./api/suggestions";
import { difficultiesRouter } from "./api/difficulties";
import { statsRouter } from "./api/statistics";
import { reportsRouter } from "./api/reports";

config({ quiet: true });

const app = express();

app.use(morgan(process.env.MORGANTYPE || "tiny"));

const frontendPath = path.join(
  process.cwd(),
  "frontend",
  "dist",
  "frontend",
  "browser",
);
console.log("Serving frontend from: ", frontendPath);

app.use(express.static(frontendPath));
app.use("/uploads", express.static(process.env.UPLOADSDIR || "./uploads"));

const apiUrl = process.env.APIURL || "/api";

app.use(express.json());

async function main() {
  await initAuth(app);
  console.log("Initialize authorization framework");

  await openDb();
  console.log("Main database connected");

  app.use("/api/auth", authRouter);

  app.use(apiUrl + "/users", usersRouter);
  app.use(apiUrl + "/quizzes", quizzesRouter);
  app.use(apiUrl + "/categories", categoriesRouter);
  app.use(apiUrl + "/suggestions", suggestionsRouter);
  app.use(apiUrl + "/difficulties", difficultiesRouter);
  app.use(apiUrl + "/statistics", statsRouter);
  app.use(apiUrl + "/reports", reportsRouter);

  app.use(errorHandler);

  app.get("../");
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

main().catch((err) => {
  console.error("ERROR startup failed due to", err);
});
