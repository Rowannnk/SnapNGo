import History from "@/models/History";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await dbConnect();

  const { id } = await params;

  try {
    const history = await History.findById(id);

    if (!history) {
      return NextResponse.json(
        { error: "History Data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error retrieving History data by ID:", error);
    return NextResponse.json(
      { error: "Failed to retrieve data", details: error.message },
      { status: 500 }
    );
  }
}
