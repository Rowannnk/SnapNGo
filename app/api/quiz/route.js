import dbConnect from "@/utils/dbConnect";
import Quiz from "@/models/Quiz";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { location, quizzes } = body;

    if (!location || !quizzes) {
      return NextResponse.json(
        { error: "Location and quizzes are required" },
        { status: 400 }
      );
    }

    // Validate each quiz entry
    const formattedQuizzes = quizzes.map((quiz) => {
      const { question, options, answer, rewardPoints } = quiz;

      if (!question || !options || typeof answer !== "number") {
        throw new Error(
          "Each quiz must have a question, options, and an answer index"
        );
      }

      if (answer < 0 || answer >= options.length) {
        throw new Error("Answer index is out of bounds for the options array");
      }

      return {
        question,
        options,
        answer,
        rewardPoints,
      };
    });

    // Save the new quiz
    const newQuiz = new Quiz({ location, quizzes: formattedQuizzes });
    await newQuiz.save();

    return NextResponse.json(
      { message: "Quiz created successfully!", quiz: newQuiz },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error Saving Quiz:", error);
    return NextResponse.json(
      { error: "Failed to save quiz.", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const locations = url.searchParams.getAll("locations");

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
