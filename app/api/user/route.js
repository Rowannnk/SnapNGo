import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request) {
  await dbConnect();

  try {
    const users = await User.find();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error retrieving users data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve data", details: error.message },
      { status: 500 }
    );
  }
}
