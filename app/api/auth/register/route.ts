import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/token";
import prisma from "@/prisma/client";

const RegisterSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  username: z
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
    ),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số"
    ),
  fullname: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
  address: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RegisterSchema.parse(body);

    // Check for existing user
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

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create new user
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

    // Generate JWT token
    const token = await generateToken({
      sub: user.idUsers,
      email: user.Email || "",
      role: user.idRole ?? 2,
      username: user.Tentaikhoan,
    });

    // Update user's token
    await prisma.users.update({
      where: { idUsers: user.idUsers },
      data: { Token: token },
    });

    // Prepare response
    const response = NextResponse.json({
      message: "Đăng ký thành công",
      user: {
        id: user.idUsers,
        email: user.Email,
        username: user.Tentaikhoan,
        fullname: user.Hoten,
        role: "user",
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
        {
          error: "Dữ liệu không hợp lệ",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Lỗi trong quá trình đăng ký" },
      { status: 500 }
    );
  }
}
