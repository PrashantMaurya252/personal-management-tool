import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema(
  {
    // Job Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    hiringManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HiringManager",
    },

    jobTitle: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      enum: [
        "LinkedIn",
        "Naukri",
        "Indeed",
        "Referral",
        "Company Website",
        "Other",
      ],
      default: "LinkedIn",
    },

    jobUrl: String,

    jobDescription: String,

    minimumExperience: Number,

    // AI Generation
    aiProvider: {
      type: String,
      enum: ["gemini", "grok", "openai"],
      default: "gemini",
    },

    generatedEmailSubject: String,

    generatedEmailBody: String,

    generatedWhatsappMessage: String,

    // Resume
    resume: {
      fileName: String,
      fileUrl: String,

      viewed: {
        type: Boolean,
        default: false,
      },

      viewCount: {
        type: Number,
        default: 0,
      },

      viewedAt: [Date],
    },

    // Email Tracking
    email: {
      status: {
        type: String,
        enum: ["draft", "queued", "sent", "failed", "replied"],
        default: "draft",
      },

      sentAt: Date,

      opens: [
        {
          timestamp: Date,
          userAgent: String,
          ipAddress: String,
        },
      ],

      openCount: {
        type: Number,
        default: 0,
      },

      clickedLinks: [
        {
          url: String,
          clickedAt: Date,
          userAgent: String,
          ipAddress: String,
        },
      ],
    },

    // WhatsApp Tracking
    whatsapp: {
      status: {
        type: String,
        enum: ["draft", "sent", "delivered", "read", "failed"],
        default: "draft",
      },

      sentAt: Date,

      deliveredAt: Date,

      readAt: Date,

      clickedLinks: [
        {
          url: String,
          clickedAt: Date,
        },
      ],
    },

    // Application Status
    applicationStatus: {
      type: String,
      enum: [
        "pending",
        "applied",
        "viewed",
        "interview",
        "rejected",
        "selected",
      ],
      default: "pending",
    },

    notes: String,

    tags: [String],
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.JobApplication ||
  mongoose.model("JobApplication", JobApplicationSchema);
