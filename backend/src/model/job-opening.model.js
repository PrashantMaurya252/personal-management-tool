import mongoose from "mongoose";

const JobOpeningSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    applyLink: {
      type: String,
      required: true,
    },
    dateFound: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["new", "viewed", "applied", "rejected"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

const JobOpeningModel =
  mongoose.models.JobOpening || mongoose.model("JobOpening", JobOpeningSchema);

export default JobOpeningModel;
