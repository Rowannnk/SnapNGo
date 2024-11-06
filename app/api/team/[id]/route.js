import Team from "@/models/Team";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    await dbConnect();

    const team = await Team.findById(id).populate(
      "members",
      "name profileImageUrl totalPoints"
    );

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Team retrieved successfully.", team },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving team:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving the team." },
      { status: 500 }
    );
  }
}
