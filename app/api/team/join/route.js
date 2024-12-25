import Team from "@/models/Team";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, teamId } = await request.json();

    await dbConnect();

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if the user is already part of a team
    if (user.teamId) {
      return NextResponse.json(
        { message: "User is already part of a team" },
        { status: 400 }
      );
    }

    // Fetch the team
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Check if the team has reached its max member capacity
    if (team.members.length >= team.maxMember) {
      return NextResponse.json(
        { message: "Team has reached maximum member capacity" },
        { status: 400 }
      );
    }

    // Check if the user is already in the members list (redundant check)
    if (team.members.includes(userId)) {
      return NextResponse.json(
        { message: "User is already a member of this team" },
        { status: 400 }
      );
    }

    // Add the user to the team members list
    team.members.push(userId);
    await team.save();

    // Update the user's teamId and sync totalTasks
    user.teamId = team._id;
    user.tasks = team.assignedQuizzes.map((quiz) => ({
      quizId: quiz._id,
      status: "pending",
    }));
    await user.save();

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
