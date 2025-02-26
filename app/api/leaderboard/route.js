import dbConnect from "@/utils/dbConnect";
import Team from "@/models/Team";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const teams = await Team.find()
      .populate({
        path: "members",
        select: "name teamPoints",
        options: { sort: { teamPoints: -1 } },
      })
      .select("teamName members");

    if (!teams.length) {
      return NextResponse.json({ error: "No teams found." }, { status: 404 });
    }

    const leaderboard = teams.map((team) => ({
      teamName: team.teamName,
      members: team.members.map((member) => ({
        name: member.name,
        teamPoints: member.teamPoints,
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
