import History from "@/models/History";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    console.log("Received request body:", body);

    if (!body.type || !body.title || !body.description) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, description" },
        { status: 400 }
      );
    }

    const historyData = new History(body);
    await historyData.save();

    return NextResponse.json({
      message: "History data added successfully",
      faculty,
    });
  } catch (error) {
    console.error("Error inserting history data:", error);
    return NextResponse.json(
      { error: "Failed to insert data", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  await dbConnect();

  try {
    const historyRecords = await History.find();
    return NextResponse.json({
      message: "History data retrieved successfully",
      data: historyRecords,
    });
  } catch (error) {
    console.error("Error retrieving history data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve data", details: error.message },
      { status: 500 }
    );
  }
}
