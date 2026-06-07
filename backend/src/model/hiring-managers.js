import mongoose from "mongoose";

const HiringManagerSchema = new mongoose.Schema(
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

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const HiringManagerModel =
  mongoose.models.HiringManager ||
  mongoose.model("HiringManager", HiringManagerSchema);

export default HiringManagerModel;