import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Company",
      required: true,
    },

    recipientEmail: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"HiringManager",
      required: true,
    },

    profile: {
      type: String,
      required: true,
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },

    minimumExperience: Number,

    jobDescription: String,

    purpose: {
      type: String,
      enum: ["Application", "Enquiry"],
      default: "Application",
    },

    generatedSubject: String,

    generatedBody: String,

    status: {
      type: String,
      enum: ["draft", "scheduled", "sent", "failed"],
      default: "draft",
    },

    scheduledAt: Date,
    sentAt: Date,
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileData: Buffer,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const EmailModel =
  mongoose.models.JobEmail || mongoose.model("JobEmail", emailSchema);

export default EmailModel;
