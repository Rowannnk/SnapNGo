import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "Hi";

export async function POST(request) {
  try {
    const { name, email, password, dob, school, address } =
      await request.json();

    await dbConnect();

    // Check if the user or email already exists
    const existingUser = await User.findOne({ $or: [{ name }, { email }] });
    if (existingUser) {
      if (existingUser.name === name) {
        return NextResponse.json(
          {
            message:
              "Username is already taken. Please choose a different username.",
          },
          { status: 400 }
        );
      }
      if (existingUser.email === email) {
        return NextResponse.json(
          {
            message:
              "Email is already registered. Please use a different email.",
          },
          { status: 400 }
        );
      }
    }

    // Hash the password before storing it
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      school,
      dob: dob || null,
      school: school || "",
      address: address || "",
      totalPoints: 0,
      totalTasks: 0,
      tasks: [],
      completedTasks: [],
      inventory: [],
    });

    // Create a JWT token for the newly created user
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send the response with the token and user details
    return NextResponse.json(
      {
        message: "success",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          school: newUser.school,
          dob: newUser.dob,
          school: newUser.school,
          address: newUser.address,
          totalPoints: newUser.totalPoints,
          totalTasks: newUser.totalTasks,
          tasks: newUser.tasks,
          completedTasks: newUser.completedTasks,
          inventory: newUser.inventory,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during user registration:", error);
    return NextResponse.json(
      { message: "An error occurred while registering the user" },
      { status: 500 }
    );
  }
}
