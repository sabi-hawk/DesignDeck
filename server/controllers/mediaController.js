const Media = require('../models/Media');
const path = require('path');
const fs = require('fs').promises;

// Helper function to determine media type from mime type
const getMediaType = (mimeType) => {
  if (mimeType.startsWith('image/')) {
    return mimeType === 'image/svg+xml' ? 'svg' : 'image';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else if (mimeType.startsWith('audio/')) {
    return 'audio';
  }
  return 'other';
};

// @desc    Upload media file
// @route   POST /api/media/upload
// @access  Private
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { filename, originalname, mimetype, size } = req.file;
    const mediaType = getMediaType(mimetype);
    
    // Construct the URL for accessing the file
    const url = `/uploads/${filename}`;

    // Extract dimensions if provided (for images)
    const width = req.body.width ? parseInt(req.body.width) : null;
    const height = req.body.height ? parseInt(req.body.height) : null;

    // Create media record
    const media = await Media.create({
      userId: req.user.id,
      filename,
      originalName: originalname,
      url,
      type: mediaType,
      mimeType: mimetype,
      size,
      width,
      height
    });

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      media: {
        id: media._id,
        url: media.url,
        type: media.type,
        filename: media.filename,
        originalName: media.originalName,
        mimeType: media.mimeType,
        size: media.size,
        width: media.width,
        height: media.height,
        createdAt: media.createdAt
      }
    });
  } catch (error) {
    console.error('Media upload error:', error);
    
    // Delete the uploaded file if database operation failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file after failed upload:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during media upload'
    });
  }
};

// @desc    Get all media for logged-in user
// @route   GET /api/media
// @access  Private
exports.getUserMedia = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const media = await Media.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Media.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      count: media.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      media: media.map(item => ({
        id: item._id,
        url: item.url,
        type: item.type,
        filename: item.filename,
        originalName: item.originalName,
        mimeType: item.mimeType,
        size: item.size,
        width: item.width,
        height: item.height,
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving media'
    });
  }
};

// @desc    Delete media file
// @route   DELETE /api/media/:id
// @access  Private
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Check if media belongs to user
    if (media.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this media'
      });
    }

    // Delete the file from filesystem
    const filePath = path.join(__dirname, '..', 'uploads', media.filename);
    try {
      await fs.unlink(filePath);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await media.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting media'
    });
  }
};

