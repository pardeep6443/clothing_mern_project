const cloudinary = require("cloudinary").v2;
const multer = require("multer");

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
      });
      return result;
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to data URI:", err.message);
      return { url: file, secure_url: file };
    }
  }

  // Fallback to data URI when Cloudinary is not configured
  return { url: file, secure_url: file };
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };

