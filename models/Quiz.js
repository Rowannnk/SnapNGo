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
        type: Number,
        required: true,
      },
      rewardPoints: {
        type: Number,
        default: 10,
      },
    },
  ],
});

export default mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
