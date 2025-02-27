import Item from "@/models/Item";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";

export async function POST(request) {
  try {
    const { userId, itemId } = await request.json();

    await dbConnect();

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find the item
    const item = await Item.findById(itemId);
    if (!item) {
      return new Response(JSON.stringify({ message: "Item not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if the user has enough points to buy the item
    if (user.totalPoints < item.price) {
      return new Response(
        JSON.stringify({
          message: "Insufficient points to purchase this item",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if the item is already in the user's inventory
    const existingItemIndex = user.inventory.findIndex(
      (invItem) => invItem.itemId.toString() === itemId
    );

    if (existingItemIndex > -1) {
      return new Response(
        JSON.stringify({ message: "Item already purchased" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Deduct points from the user
    user.totalPoints -= item.price;

    // Add item to the inventory
    user.inventory.push({ itemId, quantity: 1 });

    // Save the updated user
    await user.save();

    return new Response(
      JSON.stringify({ message: "Purchase successful", user }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing purchase:", error);
    return new Response(
      JSON.stringify({
        message: "An error occurred while processing the purchase",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
