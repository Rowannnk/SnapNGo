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

    if (!user.teamIds) {
      user.teamIds = [];
    }

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

    user.teamIds.push(teamId);
    await user.save();

    team.members.push(userId);
    await team.save();

    const assignedQuizzes = team.assignedQuizzes;

    if (assignedQuizzes && assignedQuizzes.length > 0) {
      const tasks = assignedQuizzes.map((quizId) => ({
        quizId,
        status: {
          type: "pending",
          isFinished: false,
          isAnswerCorrect: false,
          userAnswerNumber: null,
        },
      }));

      console.log("Assigned Tasks:", tasks);

      user.tasks.push(...tasks);

      user.totalTasks += tasks.length;

      await user.save();
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
