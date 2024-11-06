import mongoose, { Schema } from "mongoose";

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
    profileImageUrl: {
      type: String,
      default: "",
    },
    dob: {
      type: Date,
    },
    school: {
      type: String,
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
    tasks: {
      type: [String],
      default: [],
    },
    completedTasks: {
      type: [String],
      default: [],
    },
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
        },
      ],
      default: [],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
