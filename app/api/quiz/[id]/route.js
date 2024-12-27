import Quiz from "@/models/Quiz";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    await dbConnect();

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Quiz retrieved successfully.", quiz },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving quiz:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving the quiz." },
      { status: 500 }
    );
  }
}
