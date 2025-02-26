import SnapQuiz from "@/models/SnapQuiz";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await dbConnect();

  const { id } = await params;

  try {
    const snapQuiz = await SnapQuiz.findById(id);

    if (!snapQuiz) {
      return NextResponse.json(
        { error: "Snap Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(snapQuiz);
  } catch (error) {
    console.error("Error fetching Snap Quiz by ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch Snap Quiz" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();

  const { id } = await params;

  try {
    const deletedQuiz = await SnapQuiz.findByIdAndDelete(id);

    if (!deletedQuiz) {
      return NextResponse.json(
        { error: "Snap Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Snap Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting Snap Quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete Snap Quiz" },
      { status: 500 }
    );
  }
}
