import Team from "@/models/Team";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";
import User from "@/models/User";
import Quiz from "@/models/Quiz";

// export async function POST(request) {
//   try {
//     const {
//       teamName,
//       adminUsername,
//       teamImageUrl,
//       maxMember,
//       assignedQuizzes, //(e.g., ["msme", "arts"])
//     } = await request.json();

//     await dbConnect();

//     // Find the admin user by username
//     const adminUser = await User.findOne({ name: adminUsername });

//     if (!adminUser) {
//       return NextResponse.json(
//         { message: "Admin user not found." },
//         { status: 404 }
//       );
//     }

//     // Ensure the user has the "admin" role
//     if (adminUser.role !== "admin") {
//       return NextResponse.json(
//         { message: "Only admin users can create teams." },
//         { status: 403 }
//       );
//     }

//     // Check if a team with the same name already exists
//     const existingTeam = await Team.findOne({ teamName });
//     if (existingTeam) {
//       return NextResponse.json(
//         { message: "A team with this name already exists." },
//         { status: 400 }
//       );
//     }

//     // Fetch quizzes based on locations
//     const quizzes = await Quiz.find({
//       location: { $in: assignedQuizzes },
//     }).select("quizzes"); // Fetch the quizzes array inside each quiz document

//     // Extract individual question IDs from the quizzes
//     const allQuestionIds = quizzes.flatMap(
//       (quiz) => quiz.quizzes.map((q) => q._id) // Get the _id of each question
//     );

//     const totalTasks = allQuestionIds.length;

//     const newTeam = await Team.create({
//       teamName,
//       adminUsername,
//       teamImageUrl: teamImageUrl || "",
//       maxMember,
//       members: [adminUser._id],
//       assignedQuizzes: allQuestionIds,
//       totalTasks: totalTasks,
//     });

//     // link the admin user to the team
//     adminUser.teamId = newTeam._id;
//     await adminUser.save();

//     return NextResponse.json(
//       {
//         message: "Team created successfully.",
//         team: newTeam,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error creating team:", error);
//     return NextResponse.json(
//       { message: "An error occurred while creating the team." },
//       { status: 500 }
//     );
//   }
// }
export async function POST(request) {
  try {
    const {
      teamName,
      adminEmail, // Change from adminUsername to adminEmail for uniqueness
      teamImageUrl,
      maxMember,
      assignedQuizzes,
    } = await request.json();

    await dbConnect();

    // Find the admin user by email (ensures uniqueness)
    const adminUser = await User.findOne({ email: adminEmail });

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
    }).select("quizzes");

    // Extract individual question IDs from the quizzes
    const allQuestionIds = quizzes.flatMap((quiz) =>
      quiz.quizzes.map((q) => q._id)
    );

    const totalTasks = allQuestionIds.length;

    // Create new team with adminId
    const newTeam = await Team.create({
      teamName,
      adminId: adminUser._id, // Use adminId instead of adminUsername
      teamImageUrl: teamImageUrl || "",
      maxMember,
      members: [adminUser._id],
      assignedQuizzes: allQuestionIds,
      totalTasks: totalTasks,
    });

    // Link the team to the admin's `teamIds` array
    adminUser.teamIds.push(newTeam._id);
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
    if (error.errors) {
      console.error("Validation Errors:", error.errors);
    }
    return NextResponse.json(
      { message: "An error occurred while creating the team." },
      { status: 500 }
    );
  }
}

// export async function GET() {
//   try {
//     await dbConnect();

//     const teams = await Team.find()
//       .select(
//         "teamName adminEmail teamImageUrl totalPoints totalTasks maxMember assignedQuizzes members"
//       )
//       .lean(); // .lean() returns plain JavaScript objects

//     // Transform the data to include only the IDs for assignedQuizzes and members
//     const transformedTeams = teams.map((team) => ({
//       ...team,
//       assignedQuizzes: team.assignedQuizzes || [],
//       members: team.members || [],
//     }));

//     return NextResponse.json(
//       { message: "Teams retrieved successfully.", teams: transformedTeams },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error retrieving teams:", error);
//     return NextResponse.json(
//       { message: "An error occurred while retrieving the teams." },
//       { status: 500 }
//     );
//   }
// }

export async function GET() {
  try {
    await dbConnect();

    const teams = await Team.find()
      .select(
        "teamName adminId teamImageUrl totalTasks maxMember assignedQuizzes members"
      )
      .populate("adminId", "email")
      .lean();

    const transformedTeams = teams.map((team) => ({
      ...team,
      adminEmail: team.adminId?.email || "",
      adminId: team.adminId?._id || "",
      assignedQuizzes: team.assignedQuizzes || [],
      members: team.members || [],
    }));

    return NextResponse.json(
      { message: "Teams retrieved successfully.", teams: transformedTeams },
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
