import express from "express";
import fs from "fs";
import path from "path";
import type { Express } from "express";

export function serveStatic(app: Express) {
  let distPath = process.env.PUBLIC_DIR || "/var/www/perfume-store/dist/public";
  
  // Convert to absolute path if relative
  if (!path.isAbsolute(distPath)) {
    distPath = path.resolve(process.cwd(), distPath);
  }
  
  const uploadDir = process.env.UPLOAD_DIR || "/var/www/perfume-store/dist/public/uploads";
  
  if (!fs.existsSync(distPath)) {
    console.error("❌ Missing build at " + distPath);
  } else {
    console.log("✅ Serving static files from: " + distPath);
  }
  
  app.use("/uploads", express.static(uploadDir));
  app.use(express.static(distPath));
  
  // Catch-all for SPA routing - only for non-API requests
  app.use((req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(distPath, "index.html"));
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });
}
