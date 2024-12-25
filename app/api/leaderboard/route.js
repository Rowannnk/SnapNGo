import dbConnect from "@/utils/dbConnect";
import Team from "@/models/Team";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    // Fetch all teams and populate their members
    const teams = await Team.find()
      .populate({
        path: "members",
        select: "name totalPoints", // Include only the fields you need
        options: { sort: { totalPoints: -1 } }, // Sort members by totalPoints in descending order
      })
      .select("teamName members"); // Include only teamName and members in the response

    if (!teams.length) {
      return NextResponse.json({ error: "No teams found." }, { status: 404 });
    }

    const leaderboard = teams.map((team) => ({
      teamName: team.teamName,
      members: team.members.map((member) => ({
        name: member.name,
        totalPoints: member.totalPoints,
      })),
    }));

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
