import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await dbConnect();

  const { id } = await params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error retrieving user data by ID:", error);
    return NextResponse.json(
      { error: "Failed to retrieve data", details: error.message },
      { status: 500 }
    );
  }
}
