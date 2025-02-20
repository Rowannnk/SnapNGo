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

    const assignedQuizTasksCount = user.tasks.filter((task) =>
      team.assignedQuizzes.includes(task.quizId)
    ).length;

    const assignedSnapQuizTasksCount = user.snapTaskQuiz.filter((task) =>
      team.assignedSnapQuizzes.includes(task.snapQuizId)
    ).length;

    // Total tasks from both quizzes and snap quizzes
    const totalAssignedTasks =
      assignedQuizTasksCount + assignedSnapQuizTasksCount;

    // Remove user from the team's member list
    await Team.updateOne({ _id: teamId }, { $pull: { members: userId } });

    // Remove the team ID from the user's teamIds and reset team points
    await User.updateOne(
      { _id: userId },
      {
        $pull: { teamIds: teamId },
        $set: {
          teamPoints: 0,
          totalTasks: Math.max(user.totalTasks - totalAssignedTasks, 0),
        },
      }
    );

    // Remove tasks associated with quizzes assigned to this team
    await User.updateOne(
      { _id: userId },
      { $pull: { tasks: { quizId: { $in: team.assignedQuizzes } } } }
    );

    // Remove snapTaskQuiz entries associated with the team
    await User.updateOne(
      { _id: userId },
      {
        $pull: {
          snapTaskQuiz: { snapQuizId: { $in: team.assignedSnapQuizzes } },
        },
      }
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
