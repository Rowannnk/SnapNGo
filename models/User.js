import mongoose, { Schema } from "mongoose";
import Team from "./Team";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    school: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      default: "",
    },
    dob: {
      type: Date,
    },

    address: {
      type: String,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    totalTasks: {
      type: Number,
      default: 0,
    },
    tasks: [
      {
        quizId: { type: Schema.Types.ObjectId, ref: "Quiz" }, // Quiz assigned to the user
        status: {
          type: String,
          enum: ["pending", "completed"],
          default: "pending",
        },
      },
    ],
    inventory: {
      type: [
        {
          itemId: {
            type: Schema.Types.ObjectId,
            ref: "Item",
            required: true,
          },
          quantity: {
            type: Number,
            default: 1,
          },
          isEquipped: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    teamIds: {
      type: [Schema.Types.ObjectId],
      ref: "Team",
      default: [],
    },
  },
  { timestamps: true }
);

// Middleware to remove user from teams before deletion
userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const userId = this._id;

      // Remove the user from all teams they were a part of
      await Team.updateMany(
        { members: userId },
        { $pull: { members: userId } }
      );

      next();
    } catch (error) {
      next(error);
    }
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
