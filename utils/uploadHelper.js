import supabase from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";

const BUCKET_NAME = "service-images";

// Ensure bucket exists and is public
const ensureBucketExists = async () => {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log("Creating bucket:", BUCKET_NAME);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
        return false;
      }
      
      // Set bucket to public
      const { error: policyError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl('test', 60);
        
      console.log("Bucket created successfully");
    }
    
    return true;
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
    return false;
  }
};

// Upload to Supabase
export const uploadToSupabase = async (file, folder = "blog-images") => {
  try {
    if (!file) return null;
    
    // Ensure bucket exists
    await ensureBucketExists();
    
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    console.log("Uploading to path:", filePath);
    
    // Convert buffer to proper format if needed
    let fileBuffer = file.buffer;
    if (!fileBuffer && file.path) {
      const fs = await import('fs');
      fileBuffer = fs.readFileSync(file.path);
    }
    
    // Upload to Supabase
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: true,
      });
    
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    console.log("Image uploaded successfully:", publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error("Blog Image Upload Error:", error);
    return null;
  }
};

// Delete from Supabase
export const deleteFromSupabase = async (imageUrl) => {
  try {
    if (!imageUrl) return false;
    
    console.log("Deleting image:", imageUrl);
    
    // Extract file path from URL
    let filePath = "";
    
    if (imageUrl.includes(BUCKET_NAME)) {
      const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
      if (urlParts.length > 1) {
        filePath = urlParts[1];
      }
    }
    
    if (!filePath) {
      console.warn("Could not extract file path from URL:", imageUrl);
      return false;
    }
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error("Error deleting from Supabase:", error);
      return false;
    }
    
    console.log(`Deleted file: ${filePath}`);
    return true;
    
  } catch (error) {
    console.error("Delete from Supabase error:", error);
    return false;
  }
};

// Get image URL helper
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If relative path, construct full URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(imagePath);
    
  return publicUrl;
};

// Middleware for direct upload handling
export const handleBlogImageUpload = async (req, res, next) => {
  try {
    if (req.file) {
      const imageUrl = await uploadToSupabase(req.file, "blog-images");
      if (imageUrl) {
        req.body.featuredImage = imageUrl;
      }
    }
    next();
  } catch (error) {
    console.error("Blog image upload handling error:", error);
    next(error);
  }
};