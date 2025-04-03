import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with initial credits and create a bonus transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create the user with all required fields
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          credits: 50,
          subscriptionStatus: 'INACTIVE',
        },
      });

      // Create a credit transaction for the initial bonus
      await tx.creditTransaction.create({
        data: {
          userId: newUser.id,
          amount: 50,
          type: 'BONUS',
          description: 'Welcome bonus credits'
        }
      });

      return newUser;
    });

    return NextResponse.json(
      { message: "User created successfully", user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
} 