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

export async function PATCH(request, { params }) {
  await dbConnect();

  const { id } = await params;

  try {
    // Parse the body for the data to update
    const updatedData = await request.json();

    // Find and update the history document by ID
    const updatedHistory = await History.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true } // `new: true` returns the updated document
    );

    if (!updatedHistory) {
      return NextResponse.json(
        { error: "History Data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedHistory);
  } catch (error) {
    console.error("Error updating History data:", error);
    return NextResponse.json(
      { error: "Failed to update data", details: error.message },
      { status: 500 }
    );
  }
}
