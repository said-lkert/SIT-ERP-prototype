import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { setupApiRoutes } from "./server/routes/index.js";
import db from "./server/database/connection.js";
import { createSchema, dropSchema } from "./server/database/schema.js";
import { seed } from "./server/database/seed.js";

function setupDatabase() {
  try {
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    if (!tableCheck) {
      console.log("Core tables missing. Initializing schema and seeding data...");
      createSchema();
      seed();
      console.log("Database successfully initialized.");
    } else {
      console.log("Database schema found.");
    }
  } catch (error) {
    console.error("Error during database setup:", error);
    throw error;
  }
}

async function startServer() {
  try {
    console.log("Starting server initialization...");
    setupDatabase();
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    // Setup API routes
    console.log("Setting up API routes...");
    setupApiRoutes(app);

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      console.log("Running in development mode with Vite middleware...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      console.log("Running in production mode...");
      // Production: serve static files from dist
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        console.log(`Serving static files from ${distPath}`);
        app.use(express.static(distPath));
      } else {
        console.warn(`Warning: dist directory not found at ${distPath}`);
      }
    }

    // SPA fallback
    app.get('*', (req, res) => {
      if (process.env.NODE_ENV === "production") {
        const distPath = path.join(process.cwd(), 'dist');
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('Not Found (dist/index.html missing)');
        }
      } else {
        res.status(404).send('Not Found (Development mode)');
      }
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server successfully running on port ${PORT}`);
    });
  } catch (error) {
    console.error("CRITICAL: Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
