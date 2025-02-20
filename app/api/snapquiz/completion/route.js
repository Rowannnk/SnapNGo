import SnapQuiz from "@/models/SnapQuiz";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  const { userId, taskId, selectedAnswer } = await request.json();

  try {
    // Fetch user details
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find the specific snap task in user's snapTaskQuiz array
    const task = user.snapTaskQuiz.id(taskId); // Assuming snapTaskQuiz is an array
    if (!task) {
      return NextResponse.json(
        { message: "Snap task not found" },
        { status: 404 }
      );
    }

    // Check if snap task is already completed
    if (task.status.type === "completed") {
      return NextResponse.json(
        { message: "Snap task already completed" },
        { status: 400 }
      );
    }

    // Find the SnapQuiz where quizName matches the selected answer
    const snapQuiz = await SnapQuiz.findOne({ quizName: selectedAnswer });

    // If no matching quiz is found, return incorrect answer response
    if (!snapQuiz) {
      return NextResponse.json(
        { message: "Incorrect answer. No matching quiz found." },
        { status: 200 }
      );
    }

    // Mark the task as completed
    task.status.type = "completed";
    task.status.isFinished = true;
    task.status.isAnswerCorrect = true; // Since the answer matches a quizName
    task.status.userAnswer = selectedAnswer;

    // Update user's points
    user.teamPoints += snapQuiz.rewardPoints;
    user.totalPoints += snapQuiz.rewardPoints;

    // Count total and completed snap tasks
    const sumNormalTasks = user.tasks.length;
    const sumSnapTasks = user.snapTaskQuiz.length;

    const completedNormalTasks = user.tasks.filter(
      (t) => t.status.isFinished === true
    ).length;
    const completedSnapTasks = user.snapTaskQuiz.filter(
      (t) => t.status.isFinished === true
    ).length;

    const pendingNormalTasks = user.tasks.filter(
      (task) => task.status.isFinished === false
    ).length;
    const pendingSnapTasks = user.snapTaskQuiz.filter(
      (t) => t.status.isFinished === false
    ).length;
    user.totalTasks = pendingNormalTasks + pendingSnapTasks;

    await user.save();

    return NextResponse.json(
      {
        message: "Correct answer! Snap task completed successfully.",
        user,
        isAnswerCorrect: true,
        earnedPoints: snapQuiz.rewardPoints,
        completedTaskCount: completedNormalTasks + completedSnapTasks,
        totalTaskCount: sumNormalTasks + sumSnapTasks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing snap task:", error);
    return NextResponse.json(
      { message: "Failed to complete snap task", details: error.message },
      { status: 500 }
    );
  }
}
