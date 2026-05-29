import supabase from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";

// Create a bucket for service images if it doesn't exist
const BUCKET_NAME = "service-images";

// Initialize bucket
const initBucket = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
  
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    });
  }
};

initBucket();

// Upload image to Supabase
export const uploadImage = async (file, folder = "main") => {
  try {
    if (!file || !file.buffer) return null;
    
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to Supabase:", error);
    return null;
  }
};

// Upload multiple images
export const uploadMultipleImages = async (files, folder = "gallery") => {
  if (!files || files.length === 0) return [];
  
  const uploadPromises = files.map(file => uploadImage(file, folder));
  const urls = await Promise.all(uploadPromises);
  return urls.filter(url => url !== null);
};

// Delete image from Supabase
export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const filePath = urlParts.slice(urlParts.indexOf(BUCKET_NAME) + 1).join('/');
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
};

// Delete multiple images
export const deleteMultipleImages = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) return;
  
  const deletePromises = imageUrls.map(url => deleteImage(url));
  await Promise.all(deletePromises);
};