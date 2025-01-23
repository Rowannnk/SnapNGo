import Quiz from "@/models/Quiz";
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

    const task = user.tasks.id(taskId);
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    if (task.status === "completed") {
      return NextResponse.json(
        { message: "Task already completed" },
        { status: 400 }
      );
    }

    const quiz = await Quiz.findOne({
      "quizzes._id": task.quizId, // Match the quizId inside the quizzes array
    });

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    const quizQuestion = quiz.quizzes.find(
      (q) => q._id.toString() === task.quizId.toString()
    );

    if (!quizQuestion) {
      return NextResponse.json(
        { message: "Quiz question not found" },
        { status: 404 }
      );
    }

    const isAnswerCorrect = selectedAnswer === quizQuestion.answer;

    task.status = "completed";

    if (isAnswerCorrect) {
      user.totalPoints += quizQuestion.rewardPoints;
    }

    const sumTasks = user.tasks.length;
    const completedTasks = user.tasks.filter(
      (t) => t.status === "completed"
    ).length;

    await user.save();

    return NextResponse.json(
      {
        message: "Task completed successfully",
        user,
        isAnswerCorrect,
        completedTaskCount: completedTasks,
        totalTaskCount: sumTasks,
      },
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
