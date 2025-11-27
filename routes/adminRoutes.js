const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const prisma = require('../prismaClient');
const fs = require('fs');
const path = require('path');

// Multer setup for temporary upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });


// POST route to upload image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const newImage = await prisma.image.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        section: req.body.section || 'Wedding'
      }
    });
    fs.unlinkSync(req.file.path); // Delete local file
    res.json({ success: true, image: newImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});


// GET all uploaded images
router.get('/all', async (req, res) => {
  try {
    const images = await prisma.image.findMany({
      orderBy: { uploadedAt: 'desc' }
    });
    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
