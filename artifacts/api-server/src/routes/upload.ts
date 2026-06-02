import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";
import { objectStorageClient } from "../lib/objectStorage.js";

// Primary storage: git-tracked source directory — survives every deploy forever.
// Served by the existing /blog/* static middleware in app.ts (Section 8 of CLAUDE.md).
const UPLOADS_DIR = path.resolve(
  process.cwd(),
  "artifacts/creator-toolbox/public/blog",
);
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Legacy fallback dir (kept so old /api/uploads/ URLs still resolve if files exist there)
const LEGACY_UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(LEGACY_UPLOADS_DIR)) {
  fs.mkdirSync(LEGACY_UPLOADS_DIR, { recursive: true });
}

// Memory storage so we can write to both local disk and Object Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/**
 * Parse PRIVATE_OBJECT_DIR (e.g. "/my-bucket" or "/my-bucket/private")
 * into { bucketName, prefix }.
 */
function parseObjectDir(): { bucketName: string; prefix: string } | null {
  const dir = process.env.PRIVATE_OBJECT_DIR || "";
  if (!dir) return null;
  const parts = (dir.startsWith("/") ? dir.slice(1) : dir).split("/");
  const bucketName = parts[0];
  const prefix = parts.slice(1).join("/");
  return bucketName ? { bucketName, prefix } : null;
}

function getObjectName(filename: string): string {
  const parsed = parseObjectDir();
  if (!parsed) return `uploads/${filename}`;
  return parsed.prefix ? `${parsed.prefix}/uploads/${filename}` : `uploads/${filename}`;
}

function getBucketName(): string | null {
  return parseObjectDir()?.bucketName ?? null;
}

/** Upload a buffer to Replit Object Storage. Fire-and-forget — never throws. */
async function persistToObjectStorage(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  const bucketName = getBucketName();
  if (!bucketName) return;
  try {
    const objectName = getObjectName(filename);
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    await file.save(buffer, { contentType, resumable: false });
    console.log(`[uploads] persisted to Object Storage: ${objectName}`);
  } catch (err) {
    console.error("[uploads] Object Storage write failed:", err);
  }
}

/** Fetch a file from Replit Object Storage. Returns null if missing or unavailable. */
export async function fetchFromObjectStorage(
  filename: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const bucketName = getBucketName();
  if (!bucketName) return null;
  try {
    const objectName = getObjectName(filename);
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    const [exists] = await file.exists();
    if (!exists) return null;
    const [buffer] = await file.download();
    const [meta] = await file.getMetadata();
    return { buffer, contentType: (meta.contentType as string) || "image/jpeg" };
  } catch (err) {
    console.error("[uploads] Object Storage read failed:", err);
    return null;
  }
}

const router: IRouter = Router();

router.post("/uploads/image", upload.single("image"), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No image file provided" });
    return;
  }

  const ext = path.extname(req.file.originalname).toLowerCase() || ".jpg";
  const filename = `${randomUUID()}${ext}`;

  // 1. Save to git-tracked public/blog/ — served via /blog/* static route.
  //    Files committed to git survive every deploy and server restart permanently.
  const localPath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(localPath, req.file.buffer);

  // 2. Persist to Object Storage in background (Replit only, no-op on Hostinger)
  persistToObjectStorage(filename, req.file.buffer, req.file.mimetype);

  // Return /blog/ URL — served by express.static from the git-tracked source dir
  res.json({ url: `/blog/${filename}` });
});

export default router;
