import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `dkart-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file type. Only JPG, PNG, WEBP, and SVG are supported.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded.' });
  }

  const serverBase = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
  const fileUrl = `${serverBase}/uploads/${req.file.filename}`;

  res.json({
    success: true,
    message: 'Image uploaded successfully.',
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
};

export const handleMultipleUpload = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No images uploaded.' });
  }

  const serverBase = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
  const files = req.files.map((file) => ({
    url: `${serverBase}/uploads/${file.filename}`,
    filename: file.filename,
    size: file.size
  }));

  res.json({
    success: true,
    message: `${files.length} images uploaded successfully.`,
    files
  });
};
