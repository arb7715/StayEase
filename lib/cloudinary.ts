import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Helper function to upload images
export async function uploadImage(file: string) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "stayease", // Optional folder to organize uploads
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
