import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Store uploads at project root: ./uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

function safeExt(originalName: string) {
  const ext = path.extname(originalName || "").toLowerCase();
  // allow only common image extensions
  const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
  return allowed.has(ext) ? ext : ".png";
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = safeExt(file.originalname);
    cb(null, `org-logo-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post("/org-logo", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  // Accessible because server.ts serves /uploads statically
  const url = `/uploads/${req.file.filename}`;
  return res.json({ url });
});

export default router;
