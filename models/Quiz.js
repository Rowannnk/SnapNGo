import mongoose, { mongo } from "mongoose";

const quizSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  quizzes: [
    {
      question: {
        type: String,
        required: true,
      },
      options: {
        type: [String],
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
    },
  ],
});

export default mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
