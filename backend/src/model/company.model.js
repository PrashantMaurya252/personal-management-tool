import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    linkedinUrl: {
      type: String,
      trim: true,
    },

    industry: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    companySize: {
      type: String,
      enum: [
        "1-10",
        "11-50",
        "51-200",
        "201-500",
        "501-1000",
        "1000+",
      ],
    },

    notes: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "not_applied",
        "applied",
        "interview",
        "rejected",
        "selected",
      ],
      default: "not_applied",
    },
  },
  {
    timestamps: true,
  }
);

const CompanyModel =
  mongoose.models.Company ||
  mongoose.model("Company", CompanySchema);

export default CompanyModel;