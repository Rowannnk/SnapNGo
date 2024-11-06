import Item from "@/models/Item";
import dbConnect from "@/utils/dbConnect";

export async function POST(request) {
  try {
    const { name, category, imageUrl, price } = await request.json();

    await dbConnect();

    const newItem = await Item.create({
      name,
      category,
      imageUrl,
      price,
    });

    return new Response(JSON.stringify(newItem), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating item:", error);
    return new Response(
      JSON.stringify({ message: "An error occurred while creating the item" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    const items = await Item.find({});
    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return new Response(
      JSON.stringify({ message: "An error occurred while fetching items" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
