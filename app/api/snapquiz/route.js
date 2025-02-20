import SnapQuiz from "@/models/SnapQuiz";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  try {
    const { quizName, rewardPoints } = await request.json();

    if (!quizName) {
      return NextResponse.json(
        { error: "Quiz name is required" },
        { status: 400 }
      );
    }

    const newSnapQuiz = new SnapQuiz({
      quizName,
      rewardPoints: rewardPoints || 10,
    });

    await newSnapQuiz.save();

    return NextResponse.json({
      success: true,
      message: "Snap Quiz created!",
      snapQuiz: newSnapQuiz,
    });
  } catch (error) {
    console.error("Error creating snap quiz:", error);
    return NextResponse.json(
      { error: "Failed to create Snap Quiz" },
      { status: 500 }
    );
  }
}

export async function GET() {
  await dbConnect();

  try {
    // Fetch all snap quizzes from the database
    const snapQuizzes = await SnapQuiz.find({});

    return NextResponse.json(snapQuizzes);
  } catch (error) {
    console.error("Error fetching snap quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch Snap Quizzes" },
      { status: 500 }
    );
  }
}
