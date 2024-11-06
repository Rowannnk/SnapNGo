import Team from "@/models/Team";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, teamId } = await request.json();

    // Ensure database connection
    await dbConnect();

    // Fetch the team
    const team = await Team.findById(teamId);

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Check if team has reached max member capacity
    if (team.members.length >= team.maxMember) {
      return NextResponse.json(
        { message: "Team has reached maximum member capacity" },
        { status: 400 }
      );
    }

    // Check if the user is already a member
    if (team.members.includes(userId)) {
      return NextResponse.json(
        { message: "User is already a member of this team" },
        { status: 400 }
      );
    }

    // Add the user to the members array
    team.members.push(userId);
    await team.save();

    // Update the user's totalTasks to match the team's totalTasks
    const user = await User.findById(userId);
    if (user) {
      user.totalTasks = team.totalTasks; // Set user's totalTasks to match team's totalTasks
      user.teamId = team._id; // Optionally link the user to the team by setting teamId
      await user.save();
    }

    return NextResponse.json(
      { message: "User joined the team successfully.", team },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining team:", error);
    return NextResponse.json(
      { message: "An error occurred while joining the team." },
      { status: 500 }
    );
  }
}
