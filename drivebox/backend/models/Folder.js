const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Folder name is required'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  path: {
    type: String,
    default: '/'
  }
}, { timestamps: true });

// Compound index: unique name per parent per user
folderSchema.index({ name: 1, parent: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model('Folder', folderSchema);
