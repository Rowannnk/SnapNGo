import dbConnect from "@/utils/dbConnect";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "Hi";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return NextResponse.json(
      {
        message: "success",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ message: "failure" }, { status: 500 });
  }
}
