import Team from "@/models/Team";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";
import User from "@/models/User";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get("adminEmail");

    if (!id) {
      return NextResponse.json(
        { message: "Team ID is required." },
        { status: 400 }
      );
    }

    const team = await Team.findOne({
      _id: id,
    })
      .select(
        "teamName adminEmail teamImageUrl totalTasks maxMember assignedQuizzes members"
      )
      .populate({
        path: "members",
      })
      .lean();

    if (!team) {
      return NextResponse.json(
        { message: `No team found with ID ${id}.`, team: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: `Team with ID ${id} retrieved successfully.`,
        team,
        adminEmail,
        adminId: team.adminId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving team by admin:", error); // Log the full error
    return NextResponse.json(
      { message: `An error occurred: ${error.message}` }, // Include error details
      { status: 500 }
    );
  }
}
