import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: { type: [String], default: [] },
  campuses: [
    {
      name: { type: String, required: false },
      description: { type: String, required: false },
      location: { type: String, required: false },
      images: { type: [String], default: [] },
      link: { type: String, default: "" },
    },
  ],
  chapels: [
    {
      name: { type: String, required: false },
      location: { type: String, required: false },
      description: { type: String, required: false },
      images: { type: [String], default: [] },
      link: { type: String, default: "" },
    },
  ],
});

const History =
  mongoose.models.History || mongoose.model("History", historySchema);
export default History;
