// import Quiz from "@/models/Quiz";
// import User from "@/models/User";
// import dbConnect from "@/utils/dbConnect";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   await dbConnect();

//   const { userId, taskId, selectedAnswer } = await request.json();

//   try {
//     // Fetch user details
//     const user = await User.findById(userId);
//     if (!user) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     // Find the specific task
//     const task = user.tasks.id(taskId);
//     if (!task) {
//       return NextResponse.json({ message: "Task not found" }, { status: 404 });
//     }

//     // Check if task is already completed
//     if (task.status === "completed") {
//       return NextResponse.json(
//         { message: "Task already completed" },
//         { status: 400 }
//       );
//     }

//     // Fetch all quiz details for tasks
//     const quizIds = user.tasks.map((t) => t.quizId); // Extract quiz IDs from tasks
//     const quizzes = await Quiz.aggregate([
//       { $unwind: "$quizzes" },
//       {
//         $match: {
//           "quizzes._id": { $in: quizIds }, // Match quiz IDs
//         },
//       },
//       {
//         $project: {
//           _id: "$quizzes._id",
//           question: "$quizzes.question",
//           options: "$quizzes.options",
//           answer: "$quizzes.answer",
//           rewardPoints: "$quizzes.rewardPoints",
//         },
//       },
//     ]);

//     // Map quiz details to tasks
//     const tasksWithDetails = user.tasks.map((t) => {
//       const quiz = quizzes.find((q) => q._id.equals(t.quizId));
//       return {
//         ...t.toObject(),
//         quizDetails: quiz || null, // Attach quiz details if found
//       };
//     });

//     // Find the specific quiz question
//     const quizQuestion = quizzes.find((q) => q._id.equals(task.quizId));

//     if (!quizQuestion) {
//       return NextResponse.json(
//         { message: "Quiz question not found" },
//         { status: 404 }
//       );
//     }

//     // Check if the answer is correct
//     const isAnswerCorrect = selectedAnswer === quizQuestion.answer;

//     // Update task status
//     task.status = "completed";

//     // Update user's points if the answer is correct
//     if (isAnswerCorrect) {
//       user.totalPoints += quizQuestion.rewardPoints;
//     }

//     // Count total and completed tasks
//     const sumTasks = user.tasks.length;
//     const completedTasks = user.tasks.filter(
//       (t) => t.status === "completed"
//     ).length;

//     await user.save();

//     // Attach the updated tasks with details to the response
//     const userWithDetails = {
//       ...user.toObject(),
//       tasks: tasksWithDetails,
//     };

//     return NextResponse.json(
//       {
//         message: "Task completed successfully",
//         user: userWithDetails, // Include tasks with quiz details
//         isAnswerCorrect,
//         completedTaskCount: completedTasks,
//         totalTaskCount: sumTasks,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error completing task:", error);
//     return NextResponse.json(
//       { message: "Failed to complete task", details: error.message },
//       { status: 500 }
//     );
//   }
// }

import Quiz from "@/models/Quiz";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  const { userId, taskId, selectedAnswer } = await request.json();

  try {
    // Fetch user details
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find the specific task
    const task = user.tasks.id(taskId);
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // Check if task is already completed
    if (task.status.type === "completed") {
      return NextResponse.json(
        { message: "Task already completed" },
        { status: 400 }
      );
    }

    // Fetch all quiz details for tasks
    const quizIds = user.tasks.map((t) => t.quizId); // Extract quiz IDs from tasks
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

    // Find the specific quiz question for the task
    const quizQuestion = quizzes.find((q) => q._id.equals(task.quizId));

    if (!quizQuestion) {
      return NextResponse.json(
        { message: "Quiz question not found" },
        { status: 404 }
      );
    }

    // Check if the answer is correct
    const isAnswerCorrect = selectedAnswer === quizQuestion.answer;

    // Update task status
    task.status.type = "completed";
    task.status.isFinished = true;
    task.status.isAnswerCorrect = isAnswerCorrect;
    task.status.userAnswerNumber = selectedAnswer;

    // Update user's points if the answer is correct
    if (isAnswerCorrect) {
      user.teamPoints += quizQuestion.rewardPoints;
      user.totalPoints += quizQuestion.rewardPoints;
    }

    // Count total and completed tasks
    const sumNormalTasks = user.tasks.length;
    const sumSnapTasks = user.snapTaskQuiz.length;

    const completedNormalTasks = user.tasks.filter(
      (t) => t.status.isFinished === true
    ).length;
    const completedSnapTasks = user.snapTaskQuiz.filter(
      (t) => t.status.isFinished === true
    ).length;

    const pendingNormalTasks = user.tasks.filter(
      (task) => task.status.isFinished === false
    ).length;
    const pendingSnapTasks = user.snapTaskQuiz.filter(
      (t) => t.status.isFinished === false
    ).length;
    user.totalTasks = pendingNormalTasks + pendingSnapTasks;

    await user.save();

    // Map quiz details to tasks
    const tasksWithDetails = user.tasks.map((t) => {
      const quiz = quizzes.find((q) => q._id.equals(t.quizId));
      return {
        ...t.toObject(),
        quizDetails: quiz || null, // Attach quiz details if found
      };
    });

    // Attach the updated tasks with details to the response
    const userWithDetails = {
      ...user.toObject(),
      tasks: tasksWithDetails,
    };

    return NextResponse.json(
      {
        message: "Task completed successfully",
        user: userWithDetails, // Include tasks with quiz details
        isAnswerCorrect,
        completedTaskCount: completedNormalTasks + completedSnapTasks,
        totalTaskCount: sumNormalTasks + sumSnapTasks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json(
      { message: "Failed to complete task", details: error.message },
      { status: 500 }
    );
  }
}
