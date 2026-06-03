import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },

    publicId: {
      type: String,
    },

    link: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

portfolioSchema.index({
  category: 1,
  order: 1,
});

export default mongoose.model(
  "Portfolio",
  portfolioSchema
);