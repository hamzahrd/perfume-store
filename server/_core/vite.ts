import express from "express";
import fs from "fs";
import path from "path";
import type { Express } from "express";

export function serveStatic(app: Express) {
  const distPath = process.env.PUBLIC_DIR || "/var/www/perfume-store/dist/public";
  const uploadDir = process.env.UPLOAD_DIR || "/var/www/perfume-store/dist/public/uploads";
  
  if (!fs.existsSync(distPath)) {
    console.error("❌ Missing build at " + distPath);
  } else {
    console.log("✅ Serving static files from: " + distPath);
  }
  
  app.use("/uploads", express.static(uploadDir));
  app.use(express.static(distPath));
  
  app.use("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
