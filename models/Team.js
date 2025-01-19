import mongoose, { Schema } from "mongoose";

const teamSchema = new Schema(
  {
    teamName: {
      type: String,
      required: true,
      unique: true,
    },
    adminUsername: {
      type: String,
      required: true,
    },
    teamImageUrl: {
      type: String,
      default: "",
    },
    // totalPoints: {
    //   type: Number,
    //   default: 0, // Total points scored by all team members
    // },
    totalTasks: {
      type: Number,
      default: 0,
    },
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    maxMember: {
      type: Number,
      required: true,
    },
    assignedQuizzes: {
      type: [{ type: Schema.Types.ObjectId, ref: "Quiz" }],
      default: [],
    },
  },
  { timestamps: true }
);

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);
export default Team;
