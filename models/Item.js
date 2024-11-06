import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);
export default Item;
