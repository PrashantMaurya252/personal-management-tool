import mongoose from "mongoose";

const ScoutSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    timeSlots: {
      type: [String], // Array of time strings like ["10:00", "13:00", "16:00", "18:00"]
      default: ["10:00", "13:00", "16:00", "18:00"],
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

const ScoutSettingsModel =
  mongoose.models.ScoutSettings ||
  mongoose.model("ScoutSettings", ScoutSettingsSchema);

export default ScoutSettingsModel;
