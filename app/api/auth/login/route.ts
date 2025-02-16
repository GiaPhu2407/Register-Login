import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/token";
import prisma from "@/prisma/client";
import { UserRole, getHomeRouteForRole } from "@/lib/auth/roles";

const LoginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = LoginSchema.parse(body);

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { Email: validatedData.usernameOrEmail },
          { Tentaikhoan: validatedData.usernameOrEmail },
        ],
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(
      validatedData.password,
      user.Matkhau ?? ""
    );

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Make sure to include phone and address in the token payload
    const token = await generateToken({
      sub: String(user.idUsers),
      email: user.Email ?? "",
      role: user.idRole ?? UserRole.CUSTOMER,
      username: user.Tentaikhoan ?? "",
      phone: user.Sdt ?? "",
      address: user.Diachi ?? "",
    });

    await prisma.users.update({
      where: { idUsers: user.idUsers },
      data: {
        Token: token,
        Sdt: user.Sdt ?? "", // Ensure phone number is updated
        Diachi: user.Diachi ?? "", // Ensure address is updated
      },
    });

    const finalUserRole = user.idRole ?? UserRole.CUSTOMER;
    const homeRoute = getHomeRouteForRole(finalUserRole);

    const response = NextResponse.json({
      user: {
        id: user.idUsers,
        email: user.Email,
        username: user.Tentaikhoan,
        role: user.role?.Tennguoidung ?? "customer",
        fullname: user.Hoten,
        phone: user.Sdt ?? "", // Explicitly include phone
        address: user.Diachi ?? "", // Explicitly include address
        roleId: finalUserRole,
      },
      token,
      redirectTo: homeRoute,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

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
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
