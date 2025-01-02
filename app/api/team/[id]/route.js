import Team from "@/models/Team";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    await dbConnect();

    const team = await Team.findById(id).populate(
      "members",
      "name profileImageUrl totalPoints"
    );

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Team retrieved successfully.", team },
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
  try {
    const { id } = params;
    const { adminUsername } = await request.json();

    await dbConnect();

    const team = await Team.findById(id);

    if (!team) {
      return NextResponse.json({ message: "Team not found." }, { status: 404 });
    }

    // Check if the adminUsername matches
    if (team.adminUsername !== adminUsername) {
      return NextResponse.json(
        { message: "Only the admin who created the team can delete it." },
        { status: 403 }
      );
    }

    // Remove the team ID from all users' teamIds array
    await User.updateMany(
      { teamIds: id }, // Find users where the team ID exists
      { $pull: { teamIds: id } } // Remove the team ID from the teamIds array
    );

    await Team.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Team deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the team." },
      { status: 500 }
    );
  }
}
