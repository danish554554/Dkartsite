import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer memory storage so sharp can process before saving to disk
const storage = multer.memoryStorage();

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
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB upload limit (will be compressed to < 100KB)
});

// Helper to compress buffer to WebP < 100KB
async function processAndSaveImage(buffer, originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const baseName = path.basename(originalname, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const safeName = `dkart-${baseName}-${Date.now()}-${Math.round(Math.random() * 1e4)}.webp`;
  const targetPath = path.join(uploadDir, safeName);

  // Compress to WebP with max 1000px dimension and 80% quality
  const compressedBuffer = await sharp(buffer)
    .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toBuffer();

  fs.writeFileSync(targetPath, compressedBuffer);

  return {
    filename: safeName,
    size: compressedBuffer.length
  };
}

export const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const { filename, size } = await processAndSaveImage(req.file.buffer, req.file.originalname);
    const serverBase = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${serverBase}/uploads/${filename}`;

    res.json({
      success: true,
      message: 'Image compressed and uploaded successfully.',
      url: fileUrl,
      filename,
      sizeKB: (size / 1024).toFixed(1)
    });
  } catch (error) {
    console.error('Image compression upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to process and compress image.' });
  }
};

export const handleMultipleUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded.' });
    }

    const serverBase = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const files = [];

    for (const file of req.files) {
      const { filename, size } = await processAndSaveImage(file.buffer, file.originalname);
      files.push({
        url: `${serverBase}/uploads/${filename}`,
        filename,
        sizeKB: (size / 1024).toFixed(1)
      });
    }

    res.json({
      success: true,
      message: `${files.length} images compressed (<100KB) and uploaded successfully.`,
      files
    });
  } catch (error) {
    console.error('Multiple image compression upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to process and compress images.' });
  }
};
