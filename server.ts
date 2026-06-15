import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import app from "./server/app.js";

async function startServer() {
  try {
    console.log("Starting server initialization...");
    const PORT = Number(process.env.PORT || 3000);

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
      // Production: serve static files from dist.
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        console.log(`Serving static files from ${distPath}`);
        app.use(express.static(distPath));
      } else {
        console.warn(`Warning: dist directory not found at ${distPath}`);
      }
    }

    // SPA fallback for the local Node server.
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
