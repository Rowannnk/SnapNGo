import dbConnect from "@/utils/dbConnect";
import Team from "@/models/Team";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    // Find all teams and populate the members and adminId
    const teams = await Team.find()
      .populate({
        path: "members",
        select: "name teamPoints", // Include only name and teamPoints for members
        options: { sort: { teamPoints: -1 } },
      })
      .populate("adminId", "name") // Populate the adminId to get the admin's name
      .select("teamName members adminId"); // Select teamName, members, and adminId

    if (!teams.length) {
      return NextResponse.json({ error: "No teams found." }, { status: 404 });
    }

    // Map the leaderboard data, excluding the admin
    const leaderboard = teams.map((team) => {
      const adminId = team.adminId._id.toString(); // Get the admin ID
      return {
        teamName: team.teamName,
        members: team.members
          .filter((member) => member._id.toString() !== adminId) // Exclude the admin
          .map((member) => ({
            name: member.name,
            teamPoints: member.teamPoints,
          })),
      };
    });

    return NextResponse.json(
      { message: "Team leaderboards retrieved successfully", leaderboard },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving leaderboards:", error);
    return NextResponse.json(
      { error: "Failed to retrieve leaderboards", details: error.message },
      { status: 500 }
    );
  }
}
