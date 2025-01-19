import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Quiz from "@/models/Quiz";

export async function GET(request, { params }) {
  try {
    const { id } = params; // Quiz question ID

    await dbConnect();

    // Find the quiz that contains this specific question ID
    const quiz = await Quiz.findOne({ "quizzes._id": id });

    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz question not found" },
        { status: 404 }
      );
    }

    // Extract the specific question
    const question = quiz.quizzes.find((q) => q._id.toString() === id);

    return NextResponse.json(
      { message: "Quiz question retrieved successfully.", question },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving quiz question:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving the quiz question." },
      { status: 500 }
    );
  }
}
