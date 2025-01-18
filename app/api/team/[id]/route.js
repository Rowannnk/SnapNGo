import Team from "@/models/Team";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import Quiz from "@/models/Quiz";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    await dbConnect();

    // Fetch the team and populate full details for members and assigned quizzes
    const team = await Team.findById(id)
      .populate({
        path: "members",
        select:
          "name email school profileImageUrl dob address totalPoints totalTasks tasks inventory role teamIds", // Include all desired fields for members
        populate: {
          path: "tasks.quizId", // Populate the `quizId` field within tasks
          select: "location quizzes", // Include quiz details
        },
      })
      .populate({
        path: "assignedQuizzes",
        select: "location quizzes", // Include quiz details for assigned quizzes
      });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Team retrieved successfully.", team },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving team:", error);
    return NextResponse.json(
      {
        message: "An error occurred while retrieving the team.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { adminUsername } = await request.json();

    await dbConnect();

    const team = await Team.findById(id);

    if (!team) {
      return NextResponse.json({ message: "Team not found." }, { status: 404 });
    }

    // Check if the adminUsername matches
    if (team.adminUsername !== adminUsername) {
      return NextResponse.json(
        { message: "Only the admin who created the team can delete it." },
        { status: 403 }
      );
    }

    // Remove the team ID from all users' teamIds array
    await User.updateMany(
      { teamIds: id }, // Find users where the team ID exists
      { $pull: { teamIds: id } } // Remove the team ID from the teamIds array
    );

    await Team.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Team deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the team." },
      { status: 500 }
    );
  }
}
