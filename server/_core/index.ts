import "dotenv/config";
import express from "express";
import http from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./vite";
import uploadRouter from "../upload";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Manual CORS headers (instead of cors package)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Upload route
app.use("/api", uploadRouter);

// TRPC API routes - MUST come before static files
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Serve static files LAST (catch-all)
serveStatic(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
