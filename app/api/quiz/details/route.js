import Quiz from "@/models/Quiz"; // Assuming your Quiz model is imported
import dbConnect from "@/utils/dbConnect"; // Your database connection utility
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { teamId, quizzes } = await request.json(); // Parse teamId and quiz IDs from the request body

    if (!teamId || !quizzes || quizzes.length === 0) {
      return NextResponse.json(
        { message: "Team ID and quiz IDs are required." },
        { status: 400 }
      );
    }

    await dbConnect(); // Ensure database connection

    // Fetch quizzes that match the provided IDs and are associated with the team
    const quizDetails = await Quiz.find({
      "quizzes._id": { $in: quizzes }, // Match the quiz _id within the nested quizzes array
    }).select("quizzes"); // Select only the quizzes array

    if (quizDetails.length === 0) {
      return NextResponse.json(
        { message: "No quizzes found for the provided quiz IDs." },
        { status: 404 }
      );
    }

    // Filter out the specific quizzes matching the requested quiz IDs
    const filteredQuizzes = quizDetails
      .map((quiz) =>
        quiz.quizzes.filter((q) => quizzes.includes(q._id.toString()))
      )
      .flat();

    if (filteredQuizzes.length === 0) {
      return NextResponse.json(
        { message: "No quizzes found for the provided team and quiz IDs." },
        { status: 404 }
      );
    }

    // Return the quiz details
    return NextResponse.json(
      { message: "Quizzes retrieved successfully.", quizzes: filteredQuizzes },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving quizzes:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving the quizzes." },
      { status: 500 }
    );
  }
}
