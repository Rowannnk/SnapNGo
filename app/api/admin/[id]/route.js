import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await dbConnect();

  const { id } = await params;

  try {
    const admin = await User.findOne({ _id: id, role: "admin" }).select(
      "-password"
    );

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error("Error fetching admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin" },
      { status: 500 }
    );
  }
}
