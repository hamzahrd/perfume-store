import express from "express";
import fs from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const router = express.Router();

// Use environment variable or fallback to a safe default
const uploadsDir = process.env.UPLOAD_DIR || "/var/www/perfume-store/dist/public/uploads";

async function ensureUploadsDir() {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log(`[Upload] Uploads directory ready at: ${uploadsDir}`);
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
      
      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (buffer.length > maxSize) {
        return res.status(400).json({ 
          success: false, 
          error: "File too large. Maximum size is 5MB." 
        });
      }
      
      // Validate file type (basic validation)
      const ext = req.headers["x-file-ext"] || "jpg";
      const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      
      if (!allowedExtensions.includes((ext as string).toLowerCase())) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid file type. Only image files are allowed." 
        });
      }
      
      // Generate unique filename with timestamp for better organization
      const timestamp = Date.now();
      const randomStr = randomBytes(8).toString("hex");
      const filename = `${timestamp}_${randomStr}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file
      await fs.writeFile(filepath, buffer);
      
      console.log(`[Upload] File saved: ${filename}`);

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

// Optional: Add a route to delete uploads (for admin cleanup)
router.delete("/upload/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security: Validate filename to prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid filename" 
      });
    }
    
    const filepath = path.join(uploadsDir, filename);
    await fs.unlink(filepath);
    
    console.log(`[Upload] File deleted: ${filename}`);
    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("[Upload] Delete error:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Delete failed"
    });
  }
});

export default router;
