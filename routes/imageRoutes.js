// routes/imageRoutes.js
const express = require('express');
const multer = require('multer');
const { storage, cloudinary } = require('../config/cloudinary');
const prisma = require('../prismaClient');
const router = express.Router();

const upload = multer({ storage });

// Multiple image upload with section
router.post('/upload', upload.array('images', 10), async (req, res) => {
  try {
    const { section } = req.body;

    if (!section) {
      return res.status(400).json({ message: 'Section is required' });
    }

    const uploads = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      section,
    }));

    const createdImages = await prisma.$transaction(
      uploads.map((data) =>
        prisma.image.create({ data })
      )
    );

    res.status(201).json(createdImages);
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// Get all images
router.get('/', async (req, res) => {
  try {
    const images = await prisma.image.findMany({
      orderBy: { uploadedAt: 'desc' }
    });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching images', error: err.message });
  }
});

// Delete image by id
router.delete('/:id', async (req, res) => {
  const imageId = Number(req.params.id);

  if (Number.isNaN(imageId)) {
    return res.status(400).json({ message: 'Invalid image id' });
  }

  try {
    const image = await prisma.image.findUnique({ where: { id: imageId } });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr.message);
      }
    }

    await prisma.image.delete({ where: { id: imageId } });

    res.json({ message: 'Image removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete image', error: err.message });
  }
});

module.exports = router;
