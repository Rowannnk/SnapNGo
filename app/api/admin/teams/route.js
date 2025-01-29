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
//     // Connect to the database
//     await dbConnect();

//     // Extract parameters from the request
//     const { searchParams } = new URL(request.url);
//     const adminEmail = searchParams.get("adminEmail");
//     const teamId = searchParams.get("teamId");
//     const userIdToRemove = searchParams.get("userId");

//     // Validate input
//     if (!adminEmail || !teamId || !userIdToRemove) {
//       return NextResponse.json(
//         { message: "Admin email, team ID, and user ID are required." },
//         { status: 400 }
//       );
//     }

//     // Find the team by ID and populate the adminId field
//     const team = await Team.findById(teamId).populate("adminId");

//     if (!team) {
//       return NextResponse.json({ message: "Team not found." }, { status: 404 });
//     }

//     // Check if the logged-in user is the admin of the team
//     if (team.adminId.email !== adminEmail) {
//       return NextResponse.json(
//         { message: "You are not authorized to perform this action." },
//         { status: 403 }
//       );
//     }

//     // Remove the user from the members list in the team
//     const updatedMembers = team.members.filter(
//       (memberId) => memberId.toString() !== userIdToRemove
//     );

//     if (updatedMembers.length === team.members.length) {
//       return NextResponse.json(
//         { message: "User not found in the team." },
//         { status: 404 }
//       );
//     }

//     // Update the team with the new list of members
//     team.members = updatedMembers;

//     // Update the user schema to remove the team association
//     await User.findByIdAndUpdate(userIdToRemove, {
//       $pull: { teams: teamId }, // Assuming there's a `teams` array in the User schema
//     });

//     // Save the updated team
//     await team.save();

//     return NextResponse.json(
//       { message: "User removed from the team successfully." },
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
    const { userId } = await request.json();
    const url = new URL(request.url);
    const teamId = url.searchParams.get("teamId");

    if (!teamId || !userId) {
      return NextResponse.json(
        { message: "Team ID and User ID are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Ensure the admin is the one performing the kick action
    const { adminEmail } = url.searchParams;
    if (team.adminEmail !== adminEmail) {
      return NextResponse.json(
        { message: "You are not authorized to perform this action." },
        { status: 403 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Remove the teamId from the user's teamIds array
    if (!user.teamIds.includes(teamId)) {
      return NextResponse.json(
        { message: "User is not part of this team" },
        { status: 400 }
      );
    }

    // Remove the user from the team's members array
    team.members = team.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );
    await team.save();

    // Remove the teamId from the user's teamIds array
    user.teamIds = user.teamIds.filter(
      (teamIdInUser) => teamIdInUser.toString() !== teamId.toString()
    );

    // Remove any tasks associated with the team from the user
    user.tasks = user.tasks.filter(
      (task) =>
        !task.quizId || !team.assignedQuizzes.includes(task.quizId.toString())
    );
    user.totalTasks = user.tasks.length; // Adjust total tasks count accordingly
    await user.save();

    return NextResponse.json(
      { message: "User removed from the team successfully.", team },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing user from team:", error);
    return NextResponse.json(
      {
        message: "An error occurred while removing the user from the team.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
