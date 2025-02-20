import Team from "@/models/Team";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// export async function GET(request, { params }) {
//   try {
//     const { id } = params; // Get the team ID from the URL parameters

//     await dbConnect();

//     // Fetch the team by ID and populate quiz details inside assignedQuizzes
//     const team = await Team.findById(id).populate({
//       path: "members", // Populate member details
//       select: "name email profileImageUrl role teamIds totalPoints", // Include specific member fields
//     });

//     if (!team) {
//       return NextResponse.json({ message: "Team not found." }, { status: 404 });
//     }

//     // Return the team details with populated assignedQuizzes
//     return NextResponse.json(
//       { message: "Team retrieved successfully.", team },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error retrieving team:", error);
//     return NextResponse.json(
//       { message: "An error occurred while retrieving the team." },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request, { params }) {
  try {
    const { id } = params;

    await dbConnect();

    const team = await Team.findById(id)
      .populate({
        path: "members",
        select: "name email profileImageUrl role teamIds totalPoints",
      })
      .populate({
        path: "adminId",
        select: "email",
      })
      .lean();

    if (!team) {
      return NextResponse.json({ message: "Team not found." }, { status: 404 });
    }

    const formattedTeam = {
      _id: team._id,
      teamName: team.teamName,
      adminId: team.adminId._id,
      adminEmail: team.adminId.email,
      teamImageUrl: team.teamImageUrl,
      totalTasks: team.totalTasks,
      maxMember: team.maxMember,
      assignedQuizzes: team.assignedQuizzes,
      assignedSnapQuizzes: team.assignedSnapQuizzes,
      members: team.members.map((member) => ({
        _id: member._id,
        name: member.name,
        email: member.email,
        profileImageUrl: member.profileImageUrl,
        role: member.role,
        teamIds: member.teamIds,
        totalPoints: member.totalPoints,
      })),
    };

    return NextResponse.json(
      { message: "Team retrieved successfully.", team: formattedTeam },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving team:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving the team." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();
  try {
    const { id } = params; // Team ID to delete
    const { adminEmail } = await request.json();

    console.log("Request to delete team with ID:", id);
    console.log("Admin email:", adminEmail);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid team ID." },
        { status: 400 }
      );
    }

    const team = await Team.findById(id);

    if (!team) {
      return NextResponse.json({ message: "Team not found." }, { status: 404 });
    }

    const adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser || adminUser._id.toString() !== team.members[0].toString()) {
      return NextResponse.json(
        { message: "Only the admin who created the team can delete it." },
        { status: 403 }
      );
    }

    console.log("Team found. Resetting user data and removing team...");

    const affectedUsers = await User.find({ teamIds: id });

    for (const user of affectedUsers) {
      // Remove assigned quizzes tasks from the user
      user.tasks = user.tasks.filter(
        (task) => !team.assignedQuizzes.includes(task.quizId)
      );

      // Remove snapTaskQuiz entries related to the team's snap quizzes
      user.snapTaskQuiz = user.snapTaskQuiz.filter(
        (task) => !team.assignedSnapQuizzes.includes(task.snapQuizId)
      );

      // Remove the team ID from the user's teamIds
      user.teamIds = user.teamIds.filter((teamId) => teamId.toString() !== id);

      // Adjust total tasks only by removing tasks related to the deleted team
      const remainingTasks = user.tasks.length;
      const remainingSnapTasks = user.snapTaskQuiz.length;
      user.totalTasks = remainingTasks + remainingSnapTasks;

      // Reset teamPoints to 0
      user.teamPoints = 0;

      await user.save();
    }

    console.log("All affected users updated.");

    // Delete the team
    await Team.findByIdAndDelete(id);

    console.log("Team deleted successfully.");
    return NextResponse.json(
      { message: "Team deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during team deletion:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the team." },
      { status: 500 }
    );
  }
}
