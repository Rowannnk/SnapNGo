import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import Item from "@/models/Item";

export async function POST(request) {
  try {
    await dbConnect();

    // Extract userId and itemId from the request body
    const { userId, itemId } = await request.json();

    // Check if userId and itemId are provided
    if (!userId || !itemId) {
      return NextResponse.json(
        { message: "User ID and Item ID are required." },
        { status: 400 }
      );
    }

    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Find the item in the database
    const item = await Item.findById(itemId);
    if (!item) {
      return NextResponse.json(
        { message: `Item with ID ${itemId} not found.` },
        { status: 404 }
      );
    }

    // Check if the item is already equipped
    const ownedItem = user.inventory.find((i) => i.itemId.equals(itemId));

    if (ownedItem && ownedItem.isEquipped) {
      // If it's already equipped, unequip it
      await User.updateOne(
        { _id: userId, "inventory.itemId": itemId },
        { $set: { "inventory.$.isEquipped": false } }
      );
      return NextResponse.json(
        {
          message: `Item ${item.name} unequipped successfully!`,
        },
        { status: 200 }
      );
    } else {
      // If it's not equipped, return a message that it's already unequipped
      return NextResponse.json(
        {
          message: `Item ${item.name} is already unequipped.`,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error unequipping item:", error);
    return NextResponse.json(
      {
        message: "An error occurred while processing the item.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
