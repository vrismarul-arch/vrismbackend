import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    mainImage: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    gallery: [{
      title: String,
      description: String,
      image: String,
    }],
    category: {
      type: String,
      default: "",
    },
    problemsWeSolve: [
      {
        title: String,
        description: String,
        image: String,
      },
    ],
    ourApproach: [
      {
        title: String,
        description: String,
        image: String,
      },
    ],
    technologies: [
      {
        name: String,
      },
    ],
    keyBenefits: [
      {
        title: String,
        description: String,
        image: String,
      },
    ],
    faqs: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    seoTitle: String,
    seoDescription: String,
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;