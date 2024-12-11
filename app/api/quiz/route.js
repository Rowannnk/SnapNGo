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
  await dbConnect(); // Ensure the database connection is established

  try {
    // Get the query parameters from the request URL
    const url = new URL(request.url);
    const location = url.searchParams.get("location"); // Extract the 'location' query parameter

    if (!location) {
      return NextResponse.json({
        error: "Location is required.",
      });
    }

    // Log the location to verify
    console.log("Location being searched for:", location);

    // Search for quizzes based on the location
    const locationData = await Quiz.findOne({
      location: {
        $regex: new RegExp(location, "i"), // Case-insensitive search for location
      },
    });

    // Log the found location data
    console.log("Location data:", locationData);

    if (!locationData) {
      return NextResponse.json({
        error: "No quizzes found for this location.",
      });
    }

    // Return the quizzes for the specified location
    return NextResponse.json(locationData.quizzes);
  } catch (error) {
    console.error("Error retrieving quizzes", error);
    return NextResponse.json({
      error: "Failed to retrieve quizzes.",
      details: error.message,
    });
  }
}
