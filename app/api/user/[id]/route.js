import Team from "@/models/Team";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";
import Quiz from "@/models/Quiz";
import Item from "@/models/Item";
import SnapQuiz from "@/models/SnapQuiz";

// export async function GET(request, { params }) {
//   await dbConnect();

//   const { id } = params;

//   try {
//     // Find the user by ID
//     const user = await User.findById(id);

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // Get quiz details for user's tasks
//     const quizIds = user.tasks.map((task) => task.quizId);

// const quizzes = await Quiz.aggregate([
//   { $unwind: "$quizzes" },
//   {
//     $match: {
//       "quizzes._id": { $in: quizIds },
//     },
//   },
//   {
//     $project: {
//       _id: "$quizzes._id",
//       question: "$quizzes.question",
//       options: "$quizzes.options",
//       answer: "$quizzes.answer",
//       rewardPoints: "$quizzes.rewardPoints",
//     },
//   },
// ]);

//     // Get item details for user's inventory
//     const itemIds = user.inventory.map((inv) => inv.itemId);

//     const items = await Item.find({ _id: { $in: itemIds } }).lean();

//     // Map quiz details to tasks
//     const tasksWithDetails = user.tasks.map((task) => {
//       const quiz = quizzes.find((quiz) => quiz._id.equals(task.quizId));
//       return {
//         ...task.toObject(),
//         quizDetails: quiz || null,
//       };
//     });

//     // Map item details to inventory
//     const inventoryWithDetails = user.inventory.map((inv) => {
//       const item = items.find((item) => item._id.equals(inv.itemId));
//       return {
//         ...inv.toObject(),
//         itemInfo: item || null,
//       };
//     });

//     const userWithDetails = {
//       ...user.toObject(),
//       tasks: tasksWithDetails,
//       inventory: inventoryWithDetails,
//     };

//     return NextResponse.json(userWithDetails);
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
    const user = await User.findById(id).lean(); // Use .lean() to return plain objects

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get quiz details for user's tasks
    const quizIds = user.tasks.map((task) => task.quizId);

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

    const snapQuizIds = user.snapTaskQuiz.map((task) => task.snapQuizId);

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

    // Get item details for user's inventory
    const itemIds = user.inventory.map((inv) => inv.itemId);
    const items = await Item.find({ _id: { $in: itemIds } }).lean();

    // Map quiz details to tasks
    const tasksWithDetails = user.tasks.map((task) => {
      const quiz = quizzes.find((quiz) => quiz._id.equals(task.quizId));
      return {
        ...task,
        quizDetails: quiz || null,
      };
    });

    // Map snap quiz details to snapTaskQuiz
    const snapTasksWithDetails = user.snapTaskQuiz.map((snapTask) => {
      const snapQuiz = snapQuizzes.find((snapQuiz) =>
        snapQuiz._id.equals(snapTask.snapQuizId)
      );
      return {
        ...snapTask,
        snapQuizDetails: snapQuiz || null,
      };
    });

    // Map item details to inventory
    const inventoryWithDetails = user.inventory.map((inv) => {
      const item = items.find((item) => item._id.equals(inv.itemId));
      return {
        ...inv,
        itemInfo: item || null,
      };
    });

    const userWithDetails = {
      ...user,
      tasks: tasksWithDetails,
      snapTaskQuiz: snapTasksWithDetails,
      inventory: inventoryWithDetails,
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
