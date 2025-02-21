import Team from "@/models/Team";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";
import User from "@/models/User";
import Quiz from "@/models/Quiz";
import SnapQuiz from "@/models/SnapQuiz";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get("adminEmail");

    if (!id) {
      return NextResponse.json(
        { message: "Team ID is required." },
        { status: 400 }
      );
    }

    // Find the team
    const team = await Team.findOne({
      _id: id,
    })
      .select(
        "teamName adminEmail teamImageUrl totalTasks maxMember assignedQuizzes assignedSnapQuizzes members"
      )
      .populate({
        path: "members",
      })
      .lean();

    if (!team) {
      return NextResponse.json(
        { message: `No team found with ID ${id}.`, team: null },
        { status: 200 }
      );
    }

    // Get quiz details for all members' tasks and snapTaskQuiz
    for (const member of team.members) {
      // Get quiz details for tasks
      const quizIds = member.tasks.map((task) => task.quizId);

      const quizzes = await Quiz.aggregate([
        { $unwind: "$quizzes" },
        {
          $match: {
            "quizzes._id": { $in: quizIds },
          },
        },
        {
          $project: {
            _id: "$quizzes._id",
            question: "$quizzes.question",
            options: "$quizzes.options",
            answer: "$quizzes.answer",
            rewardPoints: "$quizzes.rewardPoints",
          },
        },
      ]);

      // Map quiz details to tasks
      member.tasks = member.tasks.map((task) => {
        const quiz = quizzes.find((quiz) => quiz._id.equals(task.quizId));
        return {
          ...task,
          quizDetails: quiz || null,
        };
      });

      // Get snap quiz details for snapTaskQuiz
      const snapQuizIds = member.snapTaskQuiz.map((task) => task.snapQuizId);

      const snapQuizzes = await SnapQuiz.aggregate([
        {
          $match: {
            _id: { $in: snapQuizIds },
          },
        },
        {
          $project: {
            _id: 1, // Include _id field
            quizName: 1, // Include quizName field
            rewardPoints: 1, // Include rewardPoints field
          },
        },
      ]);

      // Map snap quiz details to snapTaskQuiz
      member.snapTaskQuiz = member.snapTaskQuiz.map((snapTask) => {
        const snapQuiz = snapQuizzes.find((snapQuiz) =>
          snapQuiz._id.equals(snapTask.snapQuizId)
        );
        return {
          ...snapTask,
          snapQuizDetails: snapQuiz || null,
        };
      });
    }

    return NextResponse.json(
      {
        message: `Team with ID ${id} retrieved successfully.`,
        team,
        adminEmail,
        adminId: team.adminId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving team by admin:", error); // Log the full error
    return NextResponse.json(
      { message: `An error occurred: ${error.message}` }, // Include error details
      { status: 500 }
    );
  }
}
