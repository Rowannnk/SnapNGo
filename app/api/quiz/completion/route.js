import Quiz from "@/models/Quiz";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  const { userId, taskId } = await request.json();

  try {
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find the task by taskId
    const task = user.tasks.id(taskId);

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Check if the task is already completed
    if (task.status === "completed") {
      return NextResponse.json(
        { message: "Task already completed" },
        { status: 400 }
      );
    }

    // Find the quiz in the quizzes array using task.quizId
    const quiz = await Quiz.findOne({
      "quizzes._id": task.quizId, // Match the quizId inside the quizzes array
    });

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    task.status = "completed";

    user.totalPoints += quiz.quizzes.find(
      (q) => q._id.toString() === task.quizId.toString()
    ).rewardPoints;

    await user.save();

    return NextResponse.json(
      { message: "Task completed successfully", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json(
      { message: "Failed to complete task", details: error.message },
      { status: 500 }
    );
  }
}
