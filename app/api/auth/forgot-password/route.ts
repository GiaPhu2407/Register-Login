import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/prisma/client";
import { generateResetToken } from "@/lib/auth/token";
import { sendResetCode } from "@/lib/email";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ForgotPasswordSchema.parse(body);

    console.log(
      "Processing forgot password request for email:",
      validatedData.email
    );

    // Tìm user
    const user = await prisma.users.findUnique({
      where: { Email: validatedData.email },
    });

    if (!user) {
      console.log("No user found with email:", validatedData.email);
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Tạo mã xác nhận
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated reset code for user:", resetCode);

    try {
      // Gửi email
      await sendResetCode(validatedData.email, resetCode);
      console.log("Reset code email sent successfully");

      // Nếu gửi email thành công, lưu thông tin
      const resetToken = await generateResetToken(user.idUsers, resetCode);

      await prisma.users.update({
        where: { idUsers: user.idUsers },
        data: {
          ResetToken: resetToken,
          ResetCode: resetCode,
          ResetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      });

      console.log("User record updated with reset token and code");

      return NextResponse.json({
        message: "Reset code sent successfully",
      });
    } catch (error) {
      console.error("Detailed error in forgot-password route:", error);
      return NextResponse.json(
        {
          error: "Failed to send reset code",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in forgot-password route:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid email format",
          details: error.errors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: "An error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
