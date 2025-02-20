import mongoose from "mongoose";

const snapQuizSchema = new mongoose.Schema({
  quizName: {
    type: String,
    required: true,
    unique: true,
  },
  rewardPoints: {
    type: Number,
    default: 10,
  },
});

export default mongoose.models.SnapQuiz ||
  mongoose.model("SnapQuiz", snapQuizSchema);
