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

// export async function DELETE(request, { params }) {
//   try {
//     const { id } = params;
//     const { adminUsername } = await request.json();

//     await dbConnect();

//     const team = await Team.findById(id);

//     if (!team) {
//       return NextResponse.json({ message: "Team not found." }, { status: 404 });
//     }

//     // Check if the adminUsername matches
//     if (team.adminUsername !== adminUsername) {
//       return NextResponse.json(
//         { message: "Only the admin who created the team can delete it." },
//         { status: 403 }
//       );
//     }

//     // Remove the team ID from all users' teamIds array
//     await User.updateMany(
//       { teamIds: id }, // Find users where the team ID exists
//       { $pull: { teamIds: id } } // Remove the team ID from the teamIds array
//     );

//     await Team.findByIdAndDelete(id);

//     return NextResponse.json(
//       { message: "Team deleted successfully." },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error deleting team:", error);
//     return NextResponse.json(
//       { message: "An error occurred while deleting the team." },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request, { params }) {
//   try {
//     const { id } = params; // ID of the team to delete
//     const { adminUsername } = await request.json();

//     console.log("Request to delete team with ID:", id);
//     console.log("Admin username:", adminUsername);

//     // Ensure valid MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { message: "Invalid team ID." },
//         { status: 400 }
//       );
//     }

//     await dbConnect();

//     const team = await Team.findById(id);

//     // Check if team exists
//     if (!team) {
//       return NextResponse.json({ message: "Team not found." }, { status: 404 });
//     }

//     // Validate adminUsername
//     if (team.adminUsername !== adminUsername) {
//       return NextResponse.json(
//         { message: "Only the admin who created the team can delete it." },
//         { status: 403 }
//       );
//     }

//     console.log("Team found. Resetting user data and removing team...");

//     // Find all users associated with this team
//     const affectedUsers = await User.find({ teamIds: id });

//     for (const user of affectedUsers) {
//       // Reset totalPoints and totalTasks to 0
//       user.totalPoints = 0;
//       user.totalTasks = 0;

//       // Remove all tasks related to this team's quizzes
//       user.tasks = user.tasks.filter(
//         (task) => !team.assignedQuizzes.includes(task.quizId)
//       );

//       // Remove the team ID from the user's teamIds
//       user.teamIds = user.teamIds.filter((teamId) => teamId.toString() !== id);

//       // Save the updated user document
//       await user.save();
//     }

//     console.log("All affected users updated.");

//     // Delete the team
//     await Team.findByIdAndDelete(id);

//     console.log("Team deleted successfully.");
//     return NextResponse.json(
//       { message: "Team deleted successfully." },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error during team deletion:", error);
//     return NextResponse.json(
//       { message: "An error occurred while deleting the team." },
//       { status: 500 }
//     );
//   }
// }

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

    await dbConnect();

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
      user.totalPoints = 0;
      user.totalTasks = 0;
      user.tasks = user.tasks.filter(
        (task) => !team.assignedQuizzes.includes(task.quizId)
      );
      user.teamIds = user.teamIds.filter((teamId) => teamId.toString() !== id);
      await user.save();
    }

    console.log("All affected users updated.");

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
