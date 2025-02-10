import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"; 
import { hashPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/token";
import prisma from "@/prisma/client";

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  fullname: z.string(),
  phone: z.string(),
  address: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RegisterSchema.parse(body);

    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { Email: validatedData.email },
          { Tentaikhoan: validatedData.username },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email hoặc tên đăng nhập đã tồn tại" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.users.create({
      data: {
        Email: validatedData.email,
        Tentaikhoan: validatedData.username,
        Matkhau: hashedPassword,
        Hoten: validatedData.fullname,
        Sdt: validatedData.phone,
        Diachi: validatedData.address || null,
        idRole: 2, // Default user role
        Ngaydangky: new Date(),
        Token: null,
      },
    });

    const token = generateToken({
      userId: user.idUsers,
      email: user.Email || "",
      role: user.idRole ?? 2,
    });

    await prisma.users.update({
      where: { idUsers: user.idUsers },
      data: { Token: token },
    });

    const response = NextResponse.json({
      message: "Đăng ký thành công",
      user: {
        id: user.idUsers,
        email: user.Email,
        username: user.Tentaikhoan,
      },
      token,
    });

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Lỗi trong quá trình đăng ký" },
      { status: 500 }
    );
  }
}
