import supabase from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";

const BUCKET_NAME = "service-images";

export const uploadResume = async (file) => {
  try {
    if (!file) return null;

    // Check if bucket exists, if not create it
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
      });
    }

    const fileExt = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `resumes/${fileName}`;

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Resume Upload Error:", error);
    return null;
  }
};

// Alternative: If you want to use the upload middleware directly
export const handleResumeUpload = async (req, res, next) => {
  try {
    if (req.file) {
      const resumeUrl = await uploadResume(req.file);
      req.body.resumeUrl = resumeUrl;
    }
    next();
  } catch (error) {
    console.error("Resume upload handling error:", error);
    next(error);
  }
};