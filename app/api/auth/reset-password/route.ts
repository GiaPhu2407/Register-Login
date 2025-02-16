import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { verifyResetToken } from "@/lib/auth/token";

const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Invalid reset code"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
    ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ResetPasswordSchema.parse(body);

    const user = await prisma.users.findUnique({
      where: { Email: validatedData.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (
      !user.ResetToken ||
      !user.ResetCode ||
      !user.ResetTokenExpiry ||
      user.ResetCode !== validatedData.code ||
      new Date() > new Date(user.ResetTokenExpiry)
    ) {
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    const isValidToken = await verifyResetToken(user.ResetToken);
    if (!isValidToken) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(validatedData.newPassword);

    await prisma.users.update({
      where: { idUsers: user.idUsers },
      data: {
        Matkhau: hashedPassword,
        ResetToken: null,
        ResetCode: null,
        ResetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid data",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while resetting password" },
      { status: 500 }
    );
  }
}
