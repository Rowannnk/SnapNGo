import Item from "@/models/Item";
import dbConnect from "@/utils/dbConnect";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const item = await Item.findById(id);

    if (!item) {
      return new Response(JSON.stringify({ message: "Item not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(item), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    return new Response(
      JSON.stringify({ message: "An error occurred while fetching the item" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
