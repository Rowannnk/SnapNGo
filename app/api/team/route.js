import Team from "@/models/Team";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { teamName, adminUsername, teamImageUrl, totalTasks, maxMember } =
      await request.json();

    await dbConnect();

    // Check if a team with the same name already exists
    const existingTeam = await Team.findOne({ teamName });
    if (existingTeam) {
      return NextResponse.json(
        { message: "A team with this name already exists." },
        { status: 400 }
      );
    }

    // Create a new team
    const newTeam = await Team.create({
      teamName,
      adminUsername,
      teamImageUrl: teamImageUrl || "",
      totalTasks: totalTasks || 0,
      maxMember,
      members: [],
    });

    return NextResponse.json(
      { message: "Team created successfully.", team: newTeam },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the team." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();

    const teams = await Team.find();
    return NextResponse.json(
      { message: "Teams retrieved successfully.", teams },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving teams:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving teams." },
      { status: 500 }
    );
  }
}
