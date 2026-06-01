// backend/controllers/serviceController.js

import Service from "../models/Service.js";
import slugify from "slugify";
import { uploadImage, deleteImage, uploadMultipleImages } from "../utils/supabaseStorage.js";
import mongoose from "mongoose";

/* ===================================================
   CREATE SERVICE
=================================================== */
export const createService = async (req, res) => {
  try {
    console.log("=== CREATE SERVICE ===");
    console.log("Files:", req.files ? Object.keys(req.files) : "No files");
    console.log("Body:", req.body);
    
    // Extract fields from req.body
    const {
      title,
      shortDescription,
      description,
      category,
      status,
      seoTitle,
      seoDescription,
      problemsWeSolve,
      ourApproach,
      keyBenefits,
      technologies,
      gallery
    } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }
    
    if (!shortDescription) {
      return res.status(400).json({
        success: false,
        message: "Short description is required"
      });
    }
    
    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Description is required"
      });
    }
    
    // Parse JSON fields
    let problemsData = [];
    let approachData = [];
    let benefitsData = [];
    let technologiesData = [];
    let galleryData = [];
    
    if (problemsWeSolve) {
      try {
        problemsData = typeof problemsWeSolve === 'string' 
          ? JSON.parse(problemsWeSolve) 
          : problemsWeSolve;
      } catch (e) {
        console.error("Error parsing problemsWeSolve:", e);
      }
    }
    
    if (ourApproach) {
      try {
        approachData = typeof ourApproach === 'string' 
          ? JSON.parse(ourApproach) 
          : ourApproach;
      } catch (e) {
        console.error("Error parsing ourApproach:", e);
      }
    }
    
    if (keyBenefits) {
      try {
        benefitsData = typeof keyBenefits === 'string' 
          ? JSON.parse(keyBenefits) 
          : keyBenefits;
      } catch (e) {
        console.error("Error parsing keyBenefits:", e);
      }
    }
    
    if (technologies) {
      try {
        technologiesData = typeof technologies === 'string' 
          ? JSON.parse(technologies) 
          : technologies;
      } catch (e) {
        console.error("Error parsing technologies:", e);
      }
    }
    
    if (gallery) {
      try {
        galleryData = typeof gallery === 'string' 
          ? JSON.parse(gallery) 
          : gallery;
      } catch (e) {
        console.error("Error parsing gallery:", e);
      }
    }
    
    // Upload main image
    let mainImageUrl = "";
    if (req.files && req.files.mainImage && req.files.mainImage[0]) {
      mainImageUrl = await uploadImage(req.files.mainImage[0], "main");
      console.log("Main image uploaded:", mainImageUrl);
    }
    
    // Upload icon image
    let iconUrl = "";
    if (req.files && req.files.icon && req.files.icon[0]) {
      iconUrl = await uploadImage(req.files.icon[0], "icons");
      console.log("Icon uploaded:", iconUrl);
    }
    
    // Upload gallery images and combine with metadata
    let processedGallery = [];
    // Handle both 'gallery' and 'galleryImages' field names
    const galleryFiles = req.files?.gallery || req.files?.galleryImages || [];
    
    for (let i = 0; i < galleryData.length; i++) {
      const item = galleryData[i];
      let imageUrl = item.image || "";
      
      // If there's a new image file for this gallery item
      if (galleryFiles[i] && galleryFiles[i].buffer) {
        imageUrl = await uploadImage(galleryFiles[i], "gallery");
        console.log(`Gallery item ${i} image uploaded:`, imageUrl);
      }
      
      processedGallery.push({
        title: item.title || "",
        description: item.description || "",
        image: imageUrl
      });
    }
    
    // Process problems with images
    const problemImages = req.files?.problemsWeSolveImages || [];
    const processedProblems = [];
    
    for (let i = 0; i < problemsData.length; i++) {
      const problem = problemsData[i];
      let imageUrl = problem.image || "";
      
      if (problemImages[i] && problemImages[i].buffer) {
        imageUrl = await uploadImage(problemImages[i], "problems");
        console.log(`Problem ${i} image uploaded:`, imageUrl);
      }
      
      processedProblems.push({
        title: problem.title || "",
        description: problem.description || "",
        image: imageUrl
      });
    }
    
    // Process approach with images
    const approachImages = req.files?.ourApproachImages || [];
    const processedApproach = [];
    
    for (let i = 0; i < approachData.length; i++) {
      const approach = approachData[i];
      let imageUrl = approach.image || "";
      
      if (approachImages[i] && approachImages[i].buffer) {
        imageUrl = await uploadImage(approachImages[i], "approach");
        console.log(`Approach ${i} image uploaded:`, imageUrl);
      }
      
      processedApproach.push({
        title: approach.title || "",
        description: approach.description || "",
        image: imageUrl
      });
    }
    
    // Process benefits with images
    const benefitImages = req.files?.keyBenefitsImages || [];
    const processedBenefits = [];
    
    for (let i = 0; i < benefitsData.length; i++) {
      const benefit = benefitsData[i];
      let imageUrl = benefit.image || "";
      
      if (benefitImages[i] && benefitImages[i].buffer) {
        imageUrl = await uploadImage(benefitImages[i], "benefits");
        console.log(`Benefit ${i} image uploaded:`, imageUrl);
      }
      
      processedBenefits.push({
        title: benefit.title || "",
        description: benefit.description || "",
        image: imageUrl
      });
    }
    
    // Process technologies
    const processedTechnologies = technologiesData.map(tech => ({
      name: tech.name || ""
    }));
    
    // Create slug
    const slug = slugify(title, { lower: true, strict: true });
    
    // Check if slug already exists
    const existingService = await Service.findOne({ slug });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "A service with this title already exists"
      });
    }
    
    // Create service
    const service = await Service.create({
      title,
      slug,
      shortDescription: shortDescription || "",
      description: description || "",
      mainImage: mainImageUrl,
      icon: iconUrl,
      gallery: processedGallery,
      category: category || "",
      status: status || "published",
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || shortDescription,
      problemsWeSolve: processedProblems,
      ourApproach: processedApproach,
      keyBenefits: processedBenefits,
      technologies: processedTechnologies,
    });
    
    console.log("Service created successfully:", service._id);
    
    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================
   GET ALL SERVICES
=================================================== */
export const getServices = async (req, res) => {
  try {
    const { status, category, featured } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    
    const services = await Service.find(query)
      .sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Error getting services:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================
   GET SERVICE BY ID OR SLUG
=================================================== */
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    let service;
    
    console.log("Looking for service with identifier:", id);
    
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
    
    if (isValidObjectId) {
      service = await Service.findById(id);
    } else {
      service = await Service.findOne({ slug: id });
    }
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    
    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Error getting service:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================
   UPDATE SERVICE
=================================================== */
export const updateService = async (req, res) => {
  try {
    console.log("=== UPDATE SERVICE ===");
    console.log("Service ID:", req.params.id);
    
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    
    // Update basic fields
    const {
      title,
      shortDescription,
      description,
      category,
      status,
      seoTitle,
      seoDescription,
      featured,
      order,
      problemsWeSolve,
      ourApproach,
      keyBenefits,
      technologies,
      gallery
    } = req.body;
    
    if (title) {
      service.title = title;
      service.slug = slugify(title, { lower: true, strict: true });
    }
    
    if (shortDescription) service.shortDescription = shortDescription;
    if (description) service.description = description;
    if (category) service.category = category;
    if (status) service.status = status;
    if (seoTitle) service.seoTitle = seoTitle;
    if (seoDescription) service.seoDescription = seoDescription;
    if (featured !== undefined) service.featured = featured === 'true' || featured === true;
    if (order !== undefined) service.order = parseInt(order);
    
    // Handle main image
    if (req.files && req.files.mainImage && req.files.mainImage[0]) {
      if (service.mainImage && service.mainImage.includes("supabase")) {
        await deleteImage(service.mainImage);
      }
      service.mainImage = await uploadImage(req.files.mainImage[0], "main");
    }
    
    // Handle icon image
    if (req.files && req.files.icon && req.files.icon[0]) {
      if (service.icon && service.icon.includes("supabase")) {
        await deleteImage(service.icon);
      }
      service.icon = await uploadImage(req.files.icon[0], "icons");
    }
    
    // Handle gallery images
    let galleryData = [];
    if (gallery) {
      try {
        galleryData = typeof gallery === 'string' 
          ? JSON.parse(gallery) 
          : gallery;
      } catch (e) {
        galleryData = [];
      }
    }
    
    // Handle both 'gallery' and 'galleryImages' field names
    const galleryFiles = req.files?.gallery || req.files?.galleryImages || [];
    const updatedGallery = [];
    
    for (let i = 0; i < galleryData.length; i++) {
      const item = galleryData[i];
      let imageUrl = item.image || "";
      
      // If there's a new image file for this gallery item
      if (galleryFiles[i] && galleryFiles[i].buffer) {
        // Delete old image if it exists and is not a URL
        if (imageUrl && imageUrl.includes("supabase")) {
          await deleteImage(imageUrl);
        }
        imageUrl = await uploadImage(galleryFiles[i], "gallery");
        console.log(`Gallery item ${i} image uploaded:`, imageUrl);
      }
      
      updatedGallery.push({
        title: item.title || "",
        description: item.description || "",
        image: imageUrl
      });
    }
    
    service.gallery = updatedGallery;
    
    // Parse and update problemsWeSolve
    if (problemsWeSolve) {
      let problemsData;
      try {
        problemsData = typeof problemsWeSolve === 'string' 
          ? JSON.parse(problemsWeSolve) 
          : problemsWeSolve;
      } catch (e) {
        problemsData = [];
      }
      
      const problemImages = req.files?.problemsWeSolveImages || [];
      const updatedProblems = [];
      
      for (let i = 0; i < problemsData.length; i++) {
        const problem = problemsData[i];
        let imageUrl = problem.image || "";
        
        if (problemImages[i] && problemImages[i].buffer) {
          if (imageUrl && imageUrl.includes("supabase")) {
            await deleteImage(imageUrl);
          }
          imageUrl = await uploadImage(problemImages[i], "problems");
        }
        
        updatedProblems.push({
          title: problem.title || "",
          description: problem.description || "",
          image: imageUrl
        });
      }
      
      service.problemsWeSolve = updatedProblems;
    }
    
    // Parse and update ourApproach
    if (ourApproach) {
      let approachData;
      try {
        approachData = typeof ourApproach === 'string' 
          ? JSON.parse(ourApproach) 
          : ourApproach;
      } catch (e) {
        approachData = [];
      }
      
      const approachImages = req.files?.ourApproachImages || [];
      const updatedApproach = [];
      
      for (let i = 0; i < approachData.length; i++) {
        const approach = approachData[i];
        let imageUrl = approach.image || "";
        
        if (approachImages[i] && approachImages[i].buffer) {
          if (imageUrl && imageUrl.includes("supabase")) {
            await deleteImage(imageUrl);
          }
          imageUrl = await uploadImage(approachImages[i], "approach");
        }
        
        updatedApproach.push({
          title: approach.title || "",
          description: approach.description || "",
          image: imageUrl
        });
      }
      
      service.ourApproach = updatedApproach;
    }
    
    // Parse and update keyBenefits
    if (keyBenefits) {
      let benefitsData;
      try {
        benefitsData = typeof keyBenefits === 'string' 
          ? JSON.parse(keyBenefits) 
          : keyBenefits;
      } catch (e) {
        benefitsData = [];
      }
      
      const benefitImages = req.files?.keyBenefitsImages || [];
      const updatedBenefits = [];
      
      for (let i = 0; i < benefitsData.length; i++) {
        const benefit = benefitsData[i];
        let imageUrl = benefit.image || "";
        
        if (benefitImages[i] && benefitImages[i].buffer) {
          if (imageUrl && imageUrl.includes("supabase")) {
            await deleteImage(imageUrl);
          }
          imageUrl = await uploadImage(benefitImages[i], "benefits");
        }
        
        updatedBenefits.push({
          title: benefit.title || "",
          description: benefit.description || "",
          image: imageUrl
        });
      }
      
      service.keyBenefits = updatedBenefits;
    }
    
    // Parse and update technologies
    if (technologies) {
      let techData;
      try {
        techData = typeof technologies === 'string' 
          ? JSON.parse(technologies) 
          : technologies;
      } catch (e) {
        techData = [];
      }
      
      service.technologies = techData.map(tech => ({
        name: tech.name || ""
      }));
    }
    
    const updated = await service.save();
    
    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service: updated,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================
   DELETE SERVICE
=================================================== */
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    
    // Delete all images from Supabase
    const deletePromises = [];
    
    if (service.mainImage && service.mainImage.includes("supabase.co")) {
      deletePromises.push(deleteImage(service.mainImage));
    }
    
    if (service.icon && service.icon.includes("supabase.co")) {
      deletePromises.push(deleteImage(service.icon));
    }
    
    if (service.gallery && service.gallery.length > 0) {
      service.gallery.forEach(item => {
        if (item.image && item.image.includes("supabase.co")) {
          deletePromises.push(deleteImage(item.image));
        }
      });
    }
    
    if (service.problemsWeSolve) {
      service.problemsWeSolve.forEach(problem => {
        if (problem.image && problem.image.includes("supabase.co")) {
          deletePromises.push(deleteImage(problem.image));
        }
      });
    }
    
    if (service.ourApproach) {
      service.ourApproach.forEach(approach => {
        if (approach.image && approach.image.includes("supabase.co")) {
          deletePromises.push(deleteImage(approach.image));
        }
      });
    }
    
    if (service.keyBenefits) {
      service.keyBenefits.forEach(benefit => {
        if (benefit.image && benefit.image.includes("supabase.co")) {
          deletePromises.push(deleteImage(benefit.image));
        }
      });
    }
    
    await Promise.all(deletePromises);
    await service.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================
   UPDATE SERVICE ORDER
=================================================== */
export const updateServiceOrder = async (req, res) => {
  try {
    const { order } = req.body;
    
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    
    service.order = order;
    await service.save();
    
    res.status(200).json({
      success: true,
      message: "Service order updated successfully",
      service,
    });
  } catch (error) {
    console.error("Error updating service order:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};