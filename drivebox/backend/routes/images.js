const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Image = require('../models/Image');
const Folder = require('../models/Folder');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// @GET /api/images - Get images in a folder
router.get('/', protect, async (req, res) => {
  try {
    const { folder } = req.query;
    if (!folder) return res.status(400).json({ message: 'Folder ID is required' });

    const folderDoc = await Folder.findOne({ _id: folder, owner: req.user._id });
    if (!folderDoc) return res.status(404).json({ message: 'Folder not found' });

    const images = await Image.find({ folder, owner: req.user._id }).sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @POST /api/images - Upload an image
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image file is required' });

    const { name, folder } = req.body;
    if (!name) return res.status(400).json({ message: 'Image name is required' });
    if (!folder) return res.status(400).json({ message: 'Folder ID is required' });

    const folderDoc = await Folder.findOne({ _id: folder, owner: req.user._id });
    if (!folderDoc) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Folder not found' });
    }

    const image = await Image.create({
      name,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      folder,
      owner: req.user._id,
      url: `/uploads/${req.file.filename}`
    });

    res.status(201).json(image);
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(500).json({ message: error.message });
  }
});

// @DELETE /api/images/:id - Delete an image
router.delete('/:id', protect, async (req, res) => {
  try {
    const image = await Image.findOne({ _id: req.params.id, owner: req.user._id });
    if (!image) return res.status(404).json({ message: 'Image not found' });

    const filePath = path.join(__dirname, '..', 'uploads', image.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Image.deleteOne({ _id: image._id });
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
