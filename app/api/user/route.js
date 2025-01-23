// import User from "@/models/User";
// import dbConnect from "@/utils/dbConnect";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   await dbConnect();

//   try {
//     const users = await User.find();

//     return NextResponse.json(users);
//   } catch (error) {
//     console.error("Error retrieving users data:", error);
//     return NextResponse.json(
//       { error: "Failed to retrieve data", details: error.message },
//       { status: 500 }
//     );
//   }
// }

import User from "@/models/User";
import Quiz from "@/models/Quiz";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request) {
  await dbConnect();

  try {
    // Use aggregation to get quiz details for each user's tasks
    const users = await User.aggregate([
      {
        $lookup: {
          from: "quizzes", // Name of the Quiz collection
          let: { taskQuizIds: "$tasks.quizId" },
          pipeline: [
            { $unwind: "$quizzes" }, // Unwind quizzes array in Quiz model
            {
              $match: {
                $expr: { $in: ["$quizzes._id", "$$taskQuizIds"] }, // Match quiz IDs
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
          ],
          as: "quizDetails", // Result will be stored in this field
        },
      },
      {
        $addFields: {
          tasks: {
            $map: {
              input: "$tasks",
              as: "task",
              in: {
                $mergeObjects: [
                  "$$task",
                  {
                    quizDetails: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$quizDetails",
                            cond: { $eq: ["$$this._id", "$$task.quizId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          quizDetails: 0, // Exclude extra field if not needed
        },
      },
    ]);

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users with quiz details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch users with quiz details",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

//MongoDB's aggregation framework, which allows you to perform complex queries, including lookups, transformations, and computations on the data
//$lookup joins the User collection with the Quiz collection.
// The let statement stores the quizId from the user's tasks in a variable called taskQuizIds.
// $unwind splits the quizzes array from the Quiz collection so that each quiz document is treated as a separate entity.
// $match filters the quizzes where the quiz ID matches any of the quizId in the user's tasks ($in operator).
// $project selects only the relevant quiz fields (e.g., _id, question, options, etc.) and excludes others.
// The result is stored in a new array field called quizDetails.
