import dbConnect from "@/utils/dbConnect";
import Team from "@/models/Team";
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  // Establish database connection
  await dbConnect();

  const { id: teamId } = await params;

  try {
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return NextResponse.json(
        { error: "Invalid team ID format." },
        { status: 400 }
      );
    }

    // Find the team by ID and populate members and admin
    const team = await Team.findById(teamId)
      .populate({
        path: "members",
        select: "name teamPoints", // Only include name and teamPoints
        options: { sort: { teamPoints: -1 } }, // Sort members by teamPoints in descending order
      })
      .populate("adminId", "name"); // Populate the admin's name

    if (!team) {
      return NextResponse.json(
        { error: `Team with ID '${teamId}' not found.` },
        { status: 404 }
      );
    }

    // Get the adminId to filter out the admin
    const adminId = team.adminId._id.toString();

    // Filter out the admin from the members list
    const leaderboard = {
      teamName: team.teamName,
      members: team.members
        .filter((member) => member._id.toString() !== adminId) // Exclude admin from leaderboard
        .map((member) => ({
          name: member.name,
          teamPoints: member.teamPoints,
        })),
    };

    return NextResponse.json(
      {
        message: `Leaderboard for team '${team.teamName}' retrieved successfully`,
        leaderboard,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving team leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to retrieve team leaderboard", details: error.message },
      { status: 500 }
    );
  }
}
