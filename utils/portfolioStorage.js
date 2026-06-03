// services/portfolioStorage.js

import supabase from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";

const BUCKET_NAME = "service-images";

export const uploadPortfolioImage = async (file) => {
  try {
    if (!file) return null;

    // Check bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets.some(
      (bucket) => bucket.name === BUCKET_NAME
    );

    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
      });
    }

    const fileExt = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `portfolio/${fileName}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return {
      imageUrl: publicUrl,
      publicId: filePath,
    };
  } catch (error) {
    console.error("Portfolio Upload Error:", error);
    return {
      imageUrl: null,
      publicId: null,
    };
  }
};

export const deletePortfolioImage = async (publicId) => {
  try {
    if (!publicId) return false;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([publicId]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Portfolio Delete Error:", error);
    return false;
  }
};

// Middleware
export const handlePortfolioUpload = async (req, res, next) => {
  try {
    if (req.file) {
      const uploadResult = await uploadPortfolioImage(req.file);

      req.body.imageUrl = uploadResult.imageUrl;
      req.body.publicId = uploadResult.publicId;
    }

    next();
  } catch (error) {
    console.error("Portfolio upload handling error:", error);
    next(error);
  }
};