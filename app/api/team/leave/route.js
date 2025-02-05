import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import Team from "@/models/Team";

export async function POST(request) {
  try {
    await dbConnect();

    const { userId, teamId } = await request.json();

    if (!userId || !teamId) {
      return NextResponse.json(
        { message: "User ID and Team ID are required." },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    const team = await Team.findById(teamId);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (!team) {
      return NextResponse.json({ message: "Team not found." }, { status: 404 });
    }

    await Team.updateOne({ _id: teamId }, { $pull: { members: userId } });

    await User.updateOne({ _id: userId }, { $pull: { teamIds: teamId } });

    await User.updateOne(
      { _id: userId },
      { $pull: { tasks: { quizId: { $in: team.assignedQuizzes } } } }
    );

    return NextResponse.json(
      { message: "User successfully left the team." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error leaving team:", error);
    return NextResponse.json(
      { message: "An error occurred while leaving the team." },
      { status: 500 }
    );
  }
}
