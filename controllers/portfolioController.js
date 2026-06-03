import Portfolio from "../models/Portfolio.js";
import {
  uploadPortfolioImage,
  deletePortfolioImage,
} from "../utils/portfolioStorage.js";

// Create Portfolio
export const createPortfolioItem = async (req, res) => {
  try {
    const { title, category, description, link, order } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: "Title and Category are required",
      });
    }

    let imageUrl = "";
    let publicId = "";

    if (req.file) {
      const uploadResult = await uploadPortfolioImage(req.file);

      if (!uploadResult?.imageUrl) {
        return res.status(400).json({
          success: false,
          message: "Image upload failed",
        });
      }

      imageUrl = uploadResult.imageUrl;
      publicId = uploadResult.publicId;
    }

    const portfolio = await Portfolio.create({
      title,
      category,
      description,
      link,
      order: order || 0,
      imageUrl,
      publicId,
    });

    res.status(201).json({
      success: true,
      data: portfolio,
      message: "Portfolio created successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Portfolio
export const getPortfolioItems = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({
      isActive: true,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Portfolio
export const getPortfolioItemById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Portfolio
export const updatePortfolioItem = async (req, res) => {
  try {
    let portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    if (req.file) {
      // Delete old image
      if (portfolio.publicId) {
        await deletePortfolioImage(portfolio.publicId);
      }

      // Upload new image
      const uploadResult = await uploadPortfolioImage(req.file);

      if (!uploadResult?.imageUrl) {
        return res.status(400).json({
          success: false,
          message: "New image upload failed",
        });
      }

      req.body.imageUrl = uploadResult.imageUrl;
      req.body.publicId = uploadResult.publicId;
    }

    portfolio = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: portfolio,
      message: "Portfolio updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Portfolio
export const deletePortfolioItem = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Delete image from Supabase
    if (portfolio.publicId) {
      await deletePortfolioImage(portfolio.publicId);
    }

    await portfolio.deleteOne();

    res.status(200).json({
      success: true,
      message: "Portfolio deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};