import Faculty from "@/models/Faculty";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await dbConnect();

  const { id } = params;

  try {
    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    const orderedFacultyData = {
      _id: faculty._id,
      name: faculty.name,
      shortDescription: faculty.shortDescription,
      longDescription: faculty.longDescription,
      location: faculty.location,
      contact: faculty.contact,
      programs: faculty.programs,
      socialMedia: faculty.socialMedia,
      locationLat: faculty.locationLat,
      locationLong: faculty.locationLong,
      link: faculty.link,
      images: faculty.images,
      createdAt: faculty.createdAt,
      updatedAt: faculty.updatedAt,
    };

    return NextResponse.json(orderedFacultyData);
  } catch (error) {
    console.error("Error retrieving faculty data by ID:", error);
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
    // Parse the JSON body from the request
    const updatedData = await request.json();

    // Find and update the faculty document
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true } // `new: true` returns the updated document
    );

    if (!updatedFaculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    return NextResponse.json(updatedFaculty);
  } catch (error) {
    console.error("Error updating faculty data:", error);
    return NextResponse.json(
      { error: "Failed to update data", details: error.message },
      { status: 500 }
    );
  }
}
