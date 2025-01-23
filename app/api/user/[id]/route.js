import Team from "@/models/Team";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";
import Quiz from "@/models/Quiz";

// export async function GET(request, { params }) {
//   await dbConnect();

//   const { id } = await params;

//   try {
//     const user = await User.findById(id);

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     return NextResponse.json(user);
//   } catch (error) {
//     console.error("Error retrieving user data by ID:", error);
//     return NextResponse.json(
//       { error: "Failed to retrieve data", details: error.message },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request, { params }) {
  await dbConnect();

  const { id } = params;

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Aggregate quiz details for tasks
    const quizIds = user.tasks.map((task) => task.quizId);

    const quizzes = await Quiz.aggregate([
      { $unwind: "$quizzes" },
      {
        $match: {
          "quizzes._id": { $in: quizIds }, // Match quiz IDs
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
    const tasksWithDetails = user.tasks.map((task) => {
      const quiz = quizzes.find((quiz) => quiz._id.equals(task.quizId));
      return {
        ...task.toObject(),
        quizDetails: quiz || null, // Attach quiz details if found
      };
    });

    // Attach the detailed tasks back to the user object
    const userWithDetails = {
      ...user.toObject(),
      tasks: tasksWithDetails,
    };

    return NextResponse.json(userWithDetails);
  } catch (error) {
    console.error("Error retrieving user data by ID:", error);
    return NextResponse.json(
      { error: "Failed to retrieve data", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  await dbConnect();

  const { id } = params;

  try {
    const updateData = await request.json();

    // Find and update user by ID
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } // `new` ensures the updated document is returned
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Failed to update user", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();

  const { id } = params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Remove user from all teams
    await Team.updateMany(
      { members: id }, // Find all teams where user is a member
      { $pull: { members: id } } // Remove user ID from members array
    );

    await user.deleteOne(); // This will delete the user

    return NextResponse.json(
      { message: "User deleted successfully and removed from teams" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Failed to delete user", details: error.message },
      { status: 500 }
    );
  }
}
