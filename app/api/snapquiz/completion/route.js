import SnapQuiz from "@/models/SnapQuiz";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  const { userId, taskId, selectedAnswer } = await request.json();

  try {
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const task = user.snapTaskQuiz.id(taskId);
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

    const snapQuiz = await SnapQuiz.findById(task.snapQuizId);
    if (!snapQuiz) {
      return NextResponse.json(
        { message: "Snap quiz not found" },
        { status: 404 }
      );
    }

    // Check if the selected answer matches the quizName of the specific quiz
    const isAnswerCorrect = selectedAnswer === snapQuiz.quizName;

    // Mark the task as completed
    task.status.type = "completed";
    task.status.isFinished = true;
    task.status.isAnswerCorrect = isAnswerCorrect; // Set based on the comparison
    task.status.userAnswer = selectedAnswer;

    // Update user's points only if the answer is correct
    if (isAnswerCorrect) {
      user.teamPoints += snapQuiz.rewardPoints;
      user.totalPoints += snapQuiz.rewardPoints;
    }

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
        message: isAnswerCorrect
          ? "Correct answer! Snap task completed successfully."
          : "Incorrect answer. Snap task completed.",
        user,
        isAnswerCorrect,
        earnedPoints: isAnswerCorrect ? snapQuiz.rewardPoints : 0,
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
