import BusinessProfile from '../models/BusinessProfile.model.js';
import { v2 as cloudinary } from 'cloudinary';

function ensureCloudinaryConfig() {
  if (!cloudinary.config().api_key) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

export const createProfile = async (req, res, next) => {
  try {
    const existing = await BusinessProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Business profile already exists. Use PUT to update.' });
    }

    const profile = await BusinessProfile.create({
      ...req.body,
      userId: req.user._id,
    });

    res.status(201).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const profile = await BusinessProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Business profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await BusinessProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true, upsert: true }
    );
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

export const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    ensureCloudinaryConfig();

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'smart-bill-logos', transformation: [{ width: 300, height: 300, crop: 'limit' }] },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const profile = await BusinessProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { logoUrl: result.secure_url } },
      { new: true }
    );

    res.json({ success: true, logoUrl: result.secure_url, profile });
  } catch (error) {
    next(error);
  }
};
