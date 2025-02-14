import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/token";
import prisma from "@/prisma/client";
import { UserRole, getHomeRouteForRole, getRoleName } from "@/lib/auth/roles";

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

function determineUserRole(email: string, username: string): UserRole {
  const emailLower = email.toLowerCase();
  const usernameLower = username.toLowerCase();

  const adminPatterns = {
    email: ["@admin.", "admin@", ".admin@"],
    username: ["admin_", "_admin_", "administrator"],
    domains: ["admin.com", "admin.net", "admin.org"],
  };

  const staffPatterns = {
    email: ["@staff.", "staff@", ".staff@", "@nhanvien.", "nhanvien@"],
    username: ["staff_", "_staff_", "nv_", "_nv_"],
    domains: ["staff.com", "staff.net", "nhanvien.com", "company-staff.com"],
  };

  const adminKeywords = ["superadmin", "systemadmin", "sysadmin", "rootadmin"];
  const staffKeywords = [
    "employee",
    "personnel",
    "officer",
    "nhanvien",
    "staffmember",
  ];

  const isAdmin =
    adminPatterns.email.some((pattern) => emailLower.includes(pattern)) ||
    adminPatterns.username.some((pattern) => usernameLower.includes(pattern)) ||
    adminPatterns.domains.some((domain) => emailLower.endsWith(domain)) ||
    adminKeywords.some(
      (keyword) =>
        emailLower.includes(keyword) || usernameLower.includes(keyword)
    );

  if (isAdmin) {
    return UserRole.ADMIN;
  }

  const isStaff =
    staffPatterns.email.some((pattern) => emailLower.includes(pattern)) ||
    staffPatterns.username.some((pattern) => usernameLower.includes(pattern)) ||
    staffPatterns.domains.some((domain) => emailLower.endsWith(domain)) ||
    staffKeywords.some(
      (keyword) =>
        emailLower.includes(keyword) || usernameLower.includes(keyword)
    );

  if (isStaff) {
    return UserRole.STAFF;
  }

  const preventAdminStaff = (email: string, username: string): boolean => {
    const restrictedTerms = [
      "admin",
      "staff",
      "nhanvien",
      "employee",
      "officer",
    ];
    return !restrictedTerms.some(
      (term) =>
        email.toLowerCase().includes(term) ||
        username.toLowerCase().includes(term)
    );
  };

  if (!preventAdminStaff(email, username)) {
    throw new Error(
      "Email hoặc tên đăng nhập không hợp lệ. Vui lòng không sử dụng các từ khóa được bảo vệ."
    );
  }

  return UserRole.CUSTOMER;
}

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

    const assignedRole = determineUserRole(
      validatedData.email,
      validatedData.username
    );
    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.users.create({
      data: {
        Email: validatedData.email,
        Tentaikhoan: validatedData.username,
        Matkhau: hashedPassword,
        Hoten: validatedData.fullname,
        Sdt: validatedData.phone,
        Diachi: validatedData.address || null,
        idRole: assignedRole,
        Ngaydangky: new Date(),
        Token: null,
      },
      include: {
        role: true,
      },
    });

    const token = await generateToken({
      sub: String(user.idUsers),
      email: user.Email ?? "",
      role: user.idRole ?? UserRole.CUSTOMER,
      username: user.Tentaikhoan ?? "",
    });

    await prisma.users.update({
      where: { idUsers: user.idUsers },
      data: { Token: token },
    });

    const finalUserRole = user.idRole ?? UserRole.CUSTOMER;
    const homeRoute = getHomeRouteForRole(finalUserRole);
    const roleName = getRoleName(finalUserRole);

    const response = NextResponse.json({
      message: `Đăng ký thành công với quyền ${roleName}`,
      user: {
        id: user.idUsers,
        email: user.Email,
        username: user.Tentaikhoan,
        fullname: user.Hoten,
        role: roleName,
        roleId: finalUserRole,
      },
      token,
      redirectTo: homeRoute,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
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
