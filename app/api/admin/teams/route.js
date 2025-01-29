import Team from "@/models/Team";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    let adminEmail = searchParams.get("adminEmail");

    adminEmail = adminEmail?.trim();

    if (!adminEmail) {
      return NextResponse.json(
        { message: "Admin email is required." },
        { status: 400 }
      );
    }

    const teams = await Team.find()
      .populate({
        path: "adminId",
        select: "email",
      })
      .lean();

    console.log("Populated Teams: ", teams);

    const filteredTeams = teams.filter(
      (team) => team.adminId && team.adminId.email === adminEmail
    );

    if (filteredTeams.length === 0) {
      const message = `No teams found created by ${adminEmail}.`;
      return NextResponse.json({ message, teams: [] }, { status: 200 });
    }

    const formattedTeams = filteredTeams.map((team) => {
      return {
        ...team,
        adminEmail: team.adminId.email,
        adminId: team.adminId._id,
      };
    });

    return NextResponse.json(
      {
        message: `Teams created by ${adminEmail} retrieved successfully.`,
        teams: formattedTeams,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving teams:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving the teams." },
      { status: 500 }
    );
  }
}

// export async function DELETE(request) {
//   try {
//     // Extract userId from URL search parameters
//     const url = new URL(request.url);
//     const userId = url.searchParams.get("userId"); // Get userId from the URL
//     const teamId = url.searchParams.get("teamId"); // Get teamId from the URL

//     // Handle cases where the required parameters are missing
//     if (!userId || !teamId) {
//       return NextResponse.json(
//         { message: "Missing userId or teamId." },
//         { status: 400 }
//       );
//     }

//     await dbConnect();

//     // Find the team by teamId
//     const team = await Team.findById(teamId);

//     if (!team) {
//       return NextResponse.json({ message: "Team not found." }, { status: 404 });
//     }

//     // Find the user by userId
//     const user = await User.findById(userId);

//     if (!user) {
//       return NextResponse.json({ message: "User not found." }, { status: 404 });
//     }

//     // Ensure the user is a member of the team
//     if (!team.members.includes(userId)) {
//       return NextResponse.json(
//         { message: "User is not a member of this team." },
//         { status: 403 }
//       );
//     }

//     // Remove the user from the team
//     team.members = team.members.filter(
//       (memberId) => memberId.toString() !== userId
//     );
//     await team.save();

//     // Optionally, remove the team from the user's teamIds if necessary
//     user.teamIds = user.teamIds.filter((id) => id.toString() !== teamId);
//     await user.save();

//     return NextResponse.json(
//       { message: "User removed from team successfully." },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error removing user from team:", error);
//     return NextResponse.json(
//       { message: "An error occurred while removing the user from the team." },
//       { status: 500 }
//     );
//   }
// }

export async function DELETE(request) {
  try {
    // Extract userId from URL search parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId"); // Get userId from the URL
    const teamId = url.searchParams.get("teamId"); // Get teamId from the URL

    // Handle cases where the required parameters are missing
    if (!userId || !teamId) {
      return NextResponse.json(
        { message: "Missing userId or teamId." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the team by teamId
    const team = await Team.findById(teamId);

    if (!team) {
      return NextResponse.json({ message: "Team not found." }, { status: 404 });
    }

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Ensure the user is a member of the team
    if (!team.members.includes(userId)) {
      return NextResponse.json(
        { message: "User is not a member of this team." },
        { status: 403 }
      );
    }

    // Remove the user from the team's members array
    team.members = team.members.filter(
      (memberId) => memberId.toString() !== userId
    );

    // Remove the user from the assigned quizzes/tasks in the user's task array
    user.tasks = user.tasks.filter((task) => {
      // Assuming each task has a `quizId` field referencing the quizzes
      return !team.assignedQuizzes.some(
        (quizId) => quizId.toString() === task.quizId.toString()
      );
    });

    // Decrease the user's total task count
    user.totalTasks = user.tasks.length;

    // Save the updated user and team
    await user.save();
    await team.save();

    // Optionally, remove the team from the user's teamIds
    user.teamIds = user.teamIds.filter((id) => id.toString() !== teamId);
    await user.save();

    return NextResponse.json(
      { message: "User removed from team and tasks updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing user from team:", error);
    return NextResponse.json(
      { message: "An error occurred while removing the user from the team." },
      { status: 500 }
    );
  }
}
