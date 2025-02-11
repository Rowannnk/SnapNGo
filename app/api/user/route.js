// //MongoDB's aggregation framework, which allows you to perform complex queries, including lookups, transformations, and computations on the data
// //$lookup joins the User collection with the Quiz collection.
// // The let statement stores the quizId from the user's tasks in a variable called taskQuizIds.
// // $unwind splits the quizzes array from the Quiz collection so that each quiz document is treated as a separate entity.
// // $match filters the quizzes where the quiz ID matches any of the quizId in the user's tasks ($in operator).
// // $project selects only the relevant quiz fields (e.g., _id, question, options, etc.) and excludes others.
// // The result is stored in a new array field called quizDetails.

// import User from "@/models/User";
// import Quiz from "@/models/Quiz";
// import dbConnect from "@/utils/dbConnect";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   await dbConnect();

//   try {
//     // Use aggregation to get quiz details for each user's tasks
//     const users = await User.aggregate([
//       {
//         $lookup: {
//           from: "quizzes",
//           let: { taskQuizIds: "$tasks.quizId" },
//           pipeline: [
//             { $unwind: "$quizzes" },
//             {
//               $match: {
//                 $expr: { $in: ["$quizzes._id", "$$taskQuizIds"] },
//               },
//             },
//             {
//               $project: {
//                 _id: "$quizzes._id",
//                 question: "$quizzes.question",
//                 options: "$quizzes.options",
//                 answer: "$quizzes.answer",
//                 rewardPoints: "$quizzes.rewardPoints",
//               },
//             },
//           ],
//           as: "quizDetails",
//         },
//       },
//       {
//         $addFields: {
//           tasks: {
//             $map: {
//               input: "$tasks",
//               as: "task",
//               in: {
//                 $mergeObjects: [
//                   "$$task",
//                   {
//                     quizDetails: {
//                       $arrayElemAt: [
//                         {
//                           $filter: {
//                             input: "$quizDetails",
//                             cond: { $eq: ["$$this._id", "$$task.quizId"] },
//                           },
//                         },
//                         0,
//                       ],
//                     },
//                     statusDetails: {
//                       type: "$$task.status.type",
//                       isFinished: "$$task.status.isFinished",
//                       isAnswerCorrect: "$$task.status.isAnswerCorrect",
//                       userAnswerNumber: "$$task.status.userAnswerNumber",
//                     },
//                   },
//                 ],
//               },
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           quizDetails: 0,
//         },
//       },
//     ]);

//     return NextResponse.json(users);
//   } catch (error) {
//     console.error("Error fetching users with quiz details:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to fetch users with quiz details",
//         details: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

import User from "@/models/User";
import Quiz from "@/models/Quiz";
import Item from "@/models/Item"; // Import Item model
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request) {
  await dbConnect();

  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "quizzes",
          let: { taskQuizIds: "$tasks.quizId" },
          pipeline: [
            { $unwind: "$quizzes" },
            {
              $match: {
                $expr: { $in: ["$quizzes._id", "$$taskQuizIds"] },
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
          as: "quizDetails",
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
                    statusDetails: {
                      type: "$$task.status.type",
                      isFinished: "$$task.status.isFinished",
                      isAnswerCorrect: "$$task.status.isAnswerCorrect",
                      userAnswerNumber: "$$task.status.userAnswerNumber",
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "items", // Collection name must match the items collection in MongoDB
          localField: "inventory.itemId", // `inventory` contains `itemId`, so we match it with `_id` from `items`
          foreignField: "_id",
          as: "itemDetails",
        },
      },
      {
        $addFields: {
          inventory: {
            $map: {
              input: "$inventory",
              as: "inv",
              in: {
                $mergeObjects: [
                  "$$inv",
                  {
                    itemInfo: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$itemDetails",
                            as: "item",
                            cond: { $eq: ["$$item._id", "$$inv.itemId"] },
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
          quizDetails: 0,
          itemDetails: 0, // Remove extra lookup array
        },
      },
    ]);

    return NextResponse.json(users);
  } catch (error) {
    console.error(
      "Error fetching users with quiz details and inventory:",
      error
    );
    return NextResponse.json(
      {
        error: "Failed to fetch users with quiz details and inventory",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
