import Team from "@/models/Team";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";
import User from "@/models/User";
import Quiz from "@/models/Quiz";

export async function POST(request) {
  try {
    const {
      teamName,
      adminUsername,
      teamImageUrl,
      maxMember,
      assignedQuizzes, // Array of quiz locations (e.g., ["msme", "arts"])
    } = await request.json();

    await dbConnect();

    // Find the admin user by username
    const adminUser = await User.findOne({ name: adminUsername });

    if (!adminUser) {
      return NextResponse.json(
        { message: "Admin user not found." },
        { status: 404 }
      );
    }

    // Ensure the user has the "admin" role
    if (adminUser.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin users can create teams." },
        { status: 403 }
      );
    }

    // Check if a team with the same name already exists
    const existingTeam = await Team.findOne({ teamName });
    if (existingTeam) {
      return NextResponse.json(
        { message: "A team with this name already exists." },
        { status: 400 }
      );
    }

    // Fetch quizzes based on locations
    const quizzes = await Quiz.find({
      location: { $in: assignedQuizzes },
    }).select("quizzes"); // Fetch the quizzes array inside each quiz document

    // Extract individual question IDs from the quizzes
    const allQuestionIds = quizzes.flatMap(
      (quiz) => quiz.quizzes.map((q) => q._id) // Get the _id of each question
    );

    // Create the new team
    const newTeam = await Team.create({
      teamName,
      adminUsername,
      teamImageUrl: teamImageUrl || "",
      maxMember,
      members: [adminUser._id],
      assignedQuizzes: allQuestionIds, // Store individual question IDs
    });

    // Optionally link the admin user to the team
    adminUser.teamId = newTeam._id;
    await adminUser.save();

    return NextResponse.json(
      {
        message: "Team created successfully.",
        team: newTeam,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the team." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    // Fetch teams and populate only _id for assignedQuizzes
    const teams = await Team.find().populate({
      path: "assignedQuizzes",
      select: "_id",
    });

    // Transform assignedQuizzes into an array of plain IDs
    const transformedTeams = teams.map((team) => ({
      ...team.toObject(),
      assignedQuizzes: team.assignedQuizzes.map((quiz) => quiz._id.toString()),
    }));

    return NextResponse.json(
      { message: "Teams retrieved successfully.", teams: transformedTeams },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving teams:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving teams." },
      { status: 500 }
    );
  }
}
