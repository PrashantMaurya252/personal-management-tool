import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },

    recipientEmail: {
      type: String,
      required: true,
    },

    profile: {
      type: String,
      required: true,
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
      enum: ["draft", "sent", "failed"],
      default: "draft",
    },

    sentAt: Date,

    tracking: {
      isOpened: {
        type: Boolean,
        default: false,
      },

      openedCount: {
        type: Number,
        default: 0,
      },

      openedAt: [Date],

      linkClicks: [
        {
          url: String,
          clickedAt: Date,
          ipAddress: String,
        },
      ],
    },

    attachments: [
      {
        fileName: String,
        fileUrl: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const EmailModel =
  mongoose.models.JobEmail ||
  mongoose.model("JobEmail", emailSchema);

export default EmailModel;