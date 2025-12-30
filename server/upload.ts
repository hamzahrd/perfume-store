import express from "express";
import fs from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "client/public/uploads");

async function ensureUploadsDir() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error("[Upload] Failed to create uploads directory:", error);
  }
}

ensureUploadsDir();

// Handle file uploads
router.post("/upload", async (req, res) => {
  try {
    // Check if this is a multipart form data request (for image uploads)
    const contentType = req.headers["content-type"];
    
    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle multipart form data (traditional file upload)
      // This would require a library like busboy or multer to properly parse
      // For now, we'll handle the custom buffer upload method
      return res.status(400).json({ 
        success: false, 
        error: "Multipart form data not fully supported in this implementation" 
      });
    } else {
      // Handle raw buffer upload (current implementation)
      const chunks: Buffer[] = [];

      req.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      await new Promise((resolve, reject) => {
        req.on("end", resolve);
        req.on("error", reject);
      });

      const buffer = Buffer.concat(chunks);
      
      // Validate file type (basic validation)
      const ext = req.headers["x-file-ext"] || "jpg";
      const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      
      if (!allowedExtensions.includes((ext as string).toLowerCase())) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid file type. Only image files are allowed." 
        });
      }
      
      // Generate unique filename
      const filename = `${randomBytes(16).toString("hex")}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file
      await fs.writeFile(filepath, buffer);

      // Return relative URL
      const fileUrl = `/uploads/${filename}`;
      res.json({ success: true, url: fileUrl });
    }
  } catch (error) {
    console.error("[Upload] Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Upload failed"
    });
  }
});

export default router;
