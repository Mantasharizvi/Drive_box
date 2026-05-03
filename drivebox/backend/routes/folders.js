const express = require('express');
const Folder = require('../models/Folder');
const Image = require('../models/Image');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: Get all nested folder IDs recursively
async function getAllNestedFolderIds(folderId) {
  const children = await Folder.find({ parent: folderId });
  let ids = [folderId];
  for (const child of children) {
    const nested = await getAllNestedFolderIds(child._id);
    ids = ids.concat(nested);
  }
  return ids;
}

// Helper: Get total size of a folder (including nested)
async function getFolderSize(folderId) {
  const allIds = await getAllNestedFolderIds(folderId);
  const result = await Image.aggregate([
    { $match: { folder: { $in: allIds } } },
    { $group: { _id: null, totalSize: { $sum: '$size' } } }
  ]);
  return result.length > 0 ? result[0].totalSize : 0;
}

// @GET /api/folders - Get root folders or children of a parent
router.get('/', protect, async (req, res) => {
  try {
    const { parent = null } = req.query;
    const folders = await Folder.find({
      owner: req.user._id,
      parent: parent || null
    }).sort({ createdAt: -1 });

    const foldersWithSize = await Promise.all(
      folders.map(async (folder) => {
        const size = await getFolderSize(folder._id);
        return { ...folder.toObject(), totalSize: size };
      })
    );

    res.json(foldersWithSize);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/folders/:id - Get a specific folder
router.get('/:id', protect, async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id })
      .populate('parent', 'name');

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const totalSize = await getFolderSize(folder._id);
    res.json({ ...folder.toObject(), totalSize });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/folders/:id/breadcrumb - Get breadcrumb trail
router.get('/:id/breadcrumb', protect, async (req, res) => {
  try {
    const breadcrumb = [];
    let current = await Folder.findOne({ _id: req.params.id, owner: req.user._id });

    if (!current) return res.status(404).json({ message: 'Folder not found' });

    while (current) {
      breadcrumb.unshift({ id: current._id, name: current.name });
      if (current.parent) {
        current = await Folder.findById(current.parent);
      } else {
        break;
      }
    }

    res.json(breadcrumb);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @POST /api/folders - Create a folder
router.post('/', protect, async (req, res) => {
  try {
    const { name, parent = null } = req.body;

    if (!name) return res.status(400).json({ message: 'Folder name is required' });

    // If parent specified, verify ownership
    if (parent) {
      const parentFolder = await Folder.findOne({ _id: parent, owner: req.user._id });
      if (!parentFolder) return res.status(404).json({ message: 'Parent folder not found' });
    }

    const folder = await Folder.create({
      name,
      owner: req.user._id,
      parent: parent || null
    });

    res.status(201).json({ ...folder.toObject(), totalSize: 0 });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A folder with this name already exists here' });
    }
    res.status(500).json({ message: error.message });
  }
});

// @PUT /api/folders/:id - Rename a folder
router.put('/:id', protect, async (req, res) => {
  try {
    const { name } = req.body;
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name },
      { new: true, runValidators: true }
    );
    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    const totalSize = await getFolderSize(folder._id);
    res.json({ ...folder.toObject(), totalSize });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @DELETE /api/folders/:id - Delete folder and all contents
router.delete('/:id', protect, async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    const allIds = await getAllNestedFolderIds(folder._id);

    // Delete all images in this folder tree
    const images = await Image.find({ folder: { $in: allIds } });
    const fs = require('fs');
    const path = require('path');
    images.forEach(img => {
      const filePath = path.join(__dirname, '..', 'uploads', img.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Image.deleteMany({ folder: { $in: allIds } });
    await Folder.deleteMany({ _id: { $in: allIds } });

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
