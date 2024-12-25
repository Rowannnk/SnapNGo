import dbConnect from "@/utils/dbConnect";
import Quiz from "@/models/Quiz";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { location, quizzes } = body;

    if (!location || !quizzes) {
      return NextResponse.json({
        error: "Location and quizzes are required",
      });
    }

    const newQuiz = new Quiz({ location, quizzes });
    await newQuiz.save();

    return NextResponse.json({
      message: "Quiz created successfully!",
      quiz: newQuiz,
    });
  } catch (error) {
    console.error("Error Saving Quiz:", error);
    return NextResponse.json({
      error: "Failed to save quiz.",
      details: error.message,
    });
  }
}

export async function GET(request) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const locations = url.searchParams.getAll("locations"); // Get multiple `locations` values as an array

    if (locations.length === 0) {
      return NextResponse.json(
        { error: "Locations parameter is required" },
        { status: 400 }
      );
    }

    const quizzes = await Quiz.find({
      location: { $in: locations.map((loc) => new RegExp(loc, "i")) },
    });

    if (quizzes.length === 0) {
      return NextResponse.json(
        { message: "No quizzes found for the specified locations" },
        { status: 404 }
      );
    }

    return NextResponse.json(quizzes, { status: 200 });
  } catch (error) {
    console.error("Error retrieving quizzes:", error);
    return NextResponse.json(
      { error: "Failed to retrieve quizzes", details: error.message },
      { status: 500 }
    );
  }
}
