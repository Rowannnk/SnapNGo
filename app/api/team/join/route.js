import Team from "@/models/Team";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    const url = new URL(request.url);
    const teamId = url.searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        { message: "Team ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Ensure teamIds is an array
    if (!user.teamIds) {
      user.teamIds = []; // Initialize if not already set
    }

    // Check if the user is already part of the team
    if (user.teamIds.includes(teamId)) {
      return NextResponse.json(
        { message: "User is already part of this team" },
        { status: 400 }
      );
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    if (team.members.length >= team.maxMember) {
      return NextResponse.json(
        { message: "Team has reached maximum member capacity" },
        { status: 400 }
      );
    }

    // Add the team to the user's teamIds
    user.teamIds.push(teamId);
    await user.save();

    // Add the user to the team's members list
    team.members.push(userId);
    await team.save();

    // Now, assign quizzes to the user based on the team
    const assignedQuizzes = team.assignedQuizzes; // Get the assigned quizzes from the team

    // If the team has assigned quizzes, assign them to the user
    if (assignedQuizzes && assignedQuizzes.length > 0) {
      const tasks = assignedQuizzes.map((quizId) => ({
        quizId,
        status: "pending", // Default status for new quizzes
      }));

      // Add the quizzes to the user's tasks array
      user.tasks.push(...tasks);

      user.totalTasks += tasks.length;

      await user.save(); // Save the updated user document
    }

    return NextResponse.json(
      { message: "User joined the team successfully.", team },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error joining team:", error);
    return NextResponse.json(
      {
        message: "An error occurred while joining the team.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
