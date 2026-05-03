/**
 * DriveBox - MongoDB Database Setup & Seed Script
 * Run: node database/seed.js
 * 
 * This creates the database, indexes, and a demo user.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/drivebox';

// ─── Schemas ────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }
}, { timestamps: true });

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  path: { type: String, default: '/' }
}, { timestamps: true });

folderSchema.index({ name: 1, parent: 1, owner: 1 }, { unique: true });

const imageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Folder = mongoose.model('Folder', folderSchema);
const Image = mongoose.model('Image', imageSchema);

// ─── Seed ────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    console.log('🔗 Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!\n');

    // Clear existing demo data
    await User.deleteMany({ email: 'demo@drivebox.com' });

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123456', 12);
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@drivebox.com',
      password: hashedPassword
    });
    console.log('👤 Demo user created:');
    console.log('   Email:    demo@drivebox.com');
    console.log('   Password: demo123456\n');

    // Create sample folder structure
    const rootFolder = await Folder.create({ name: 'My Photos', owner: user._id, parent: null });
    const subFolder1 = await Folder.create({ name: 'Vacation 2024', owner: user._id, parent: rootFolder._id });
    const subFolder2 = await Folder.create({ name: 'Family', owner: user._id, parent: rootFolder._id });
    const workFolder = await Folder.create({ name: 'Work Documents', owner: user._id, parent: null });

    console.log('📁 Sample folders created:');
    console.log('   My Photos/');
    console.log('   ├── Vacation 2024/');
    console.log('   └── Family/');
    console.log('   Work Documents/\n');

    // Print index info
    const indexes = await Folder.collection.indexes();
    console.log('📊 Database indexes:', indexes.map(i => i.name).join(', '));

    console.log('\n✅ Database setup complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Database: drivebox');
    console.log('Collections: users, folders, images');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seed();
