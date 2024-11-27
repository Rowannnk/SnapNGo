import mongoose from "mongoose";

const FacultySchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    programs: { type: [String], required: false },
    location: { type: String, required: false },
    contact: { type: String, required: false },
    socialMedia: {
      facebook: { type: String, required: false },
      instagram: { type: String, required: false },
      email: { type: String, required: false },
    },
    shortDescription: { type: String, required: false },
    longDescription: { type: String, required: false },
    abbreviation: { type: String, required: false },
    imageLogoName: { type: String, required: false },
    locationLat: { type: Number, required: false },
    locationLong: { type: Number, required: false },
    link: { type: String, default: "" },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Faculty ||
  mongoose.model("Faculty", FacultySchema);
