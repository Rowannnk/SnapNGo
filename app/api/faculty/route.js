import Faculty from "@/models/Faculty";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();

    const faculty = new Faculty(body);

    await faculty.save();

    return NextResponse.json({
      message: "Faculty data added successfully",
      faculty,
    });
  } catch (error) {
    console.error("Error inserting faculty data:", error);
    return NextResponse.json(
      { error: "Failed to insert data", details: error.message }, // Include details for debugging
      { status: 500 }
    );
  }
}

export async function GET(request) {
  await dbConnect();

  try {
    const faculties = await Faculty.find();

    const formattedFaculties = faculties.map((faculty) => ({
      _id: faculty._id,
      name: faculty.name,
      programs: faculty.programs,
      location: faculty.location,
      contact: faculty.contact,
      socialMedia: faculty.socialMedia,

      shortDescription: faculty.shortDescription,
      longDescription: faculty.longDescription,
      abbreviation: faculty.abbreviation,
      imageLogoName: faculty.imageLogoName,
      locationLat: faculty.locationLat,
      locationLong: faculty.locationLong,
      createdAt: faculty.createdAt,
      updatedAt: faculty.updatedAt,
    }));

    return NextResponse.json(formattedFaculties);
  } catch (error) {
    console.error("Error retrieving faculty data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve data", details: error.message },
      { status: 500 }
    );
  }
}
