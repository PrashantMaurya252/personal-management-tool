import mongoose, { Schema } from "mongoose";

const ResumeSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    extractedData: {
      type: Object, // Store JSON parsed by AI
      default: {},
    },
    rawText: {
      type: String, // Store raw PDF text
    },
  },
  {
    timestamps: true,
  }
);

const ResumeModel = mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);
export default ResumeModel;
