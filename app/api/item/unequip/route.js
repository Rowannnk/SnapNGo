import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";

export async function POST(request) {
  try {
    await dbConnect();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required." },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (!user.gender) {
      return NextResponse.json(
        { message: "User gender not found in database." },
        { status: 400 }
      );
    }

    await User.updateOne(
      { _id: userId },
      { $set: { "inventory.$[].isEquipped": false } }
    );

    // Determine default profile type
    const profileType = user.gender === "male" ? "boy" : "girl";

    return NextResponse.json(
      {
        message: "All items unequipped successfully!",
        EquipItems: [profileType],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error unequipping items:", error);
    return NextResponse.json(
      {
        message: "An error occurred while unequipping items.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
