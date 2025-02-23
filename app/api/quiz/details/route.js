import Quiz from "@/models/Quiz";
import SnapQuiz from "@/models/SnapQuiz";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { teamId, quizzes, snapQuizzes } = await request.json(); // Parse teamId, quizzes, and snapQuizzes from request body

    if (!teamId || (!quizzes && !snapQuizzes)) {
      return NextResponse.json(
        {
          message:
            "Team ID and at least one quiz array (quizzes or snapQuizzes) are required.",
        },
        { status: 400 }
      );
    }

    await dbConnect(); // Ensure database connection

    let quizDetails = [];
    if (quizzes && quizzes.length > 0) {
      quizDetails = await Quiz.find({ "quizzes._id": { $in: quizzes } }).select(
        "quizzes"
      );

      // Extract only the matching quizzes
      quizDetails = quizDetails
        .map((quiz) =>
          quiz.quizzes.filter((q) => quizzes.includes(q._id.toString()))
        )
        .flat();
    }

    let snapQuizDetails = [];
    if (snapQuizzes && snapQuizzes.length > 0) {
      snapQuizDetails = await SnapQuiz.find({
        _id: { $in: snapQuizzes },
      }).select("_id quizName rewardPoints");
    }

    return NextResponse.json(
      {
        message: "Quizzes retrieved successfully.",
        quizzes: quizDetails,
        snapQuizzes: snapQuizDetails,
      },
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
