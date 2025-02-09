import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import Item from "@/models/Item";

export async function POST(request) {
  try {
    await dbConnect();

    const { userId, itemIds } = await request.json();

    if (!userId || !itemIds || itemIds.length === 0) {
      return NextResponse.json(
        { message: "User ID and Item IDs are required." },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Unequip all items first
    await User.updateOne(
      { _id: userId },
      { $set: { "inventory.$[].isEquipped": false } }
    );

    // Equip the new items from the array
    const equippedItems = [];
    for (const itemId of itemIds) {
      const item = await Item.findById(itemId);
      if (!item) {
        return NextResponse.json(
          { message: `Item with ID ${itemId} not found.` },
          { status: 404 }
        );
      }

      // Update the user's inventory to equip the new item
      await User.updateOne(
        { _id: userId, "inventory.itemId": itemId },
        { $set: { "inventory.$.isEquipped": true } }
      );

      equippedItems.push(item.name); // Collect item names for the response
    }

    // Get the default profile type (boy or girl)
    const profileType = user.gender === "male" ? "boy" : "girl";

    return NextResponse.json(
      {
        message: "Items equipped successfully!",
        EquipItems: [profileType, ...equippedItems],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error equipping items:", error);
    return NextResponse.json(
      {
        message: "An error occurred while equipping items.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
