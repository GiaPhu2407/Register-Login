// import { NextRequest, NextResponse } from "next/server";
// import { z } from "zod";
// import { hashPassword } from "@/lib/auth/password";
// import { generateToken } from "@/lib/auth/token";
// import prisma from "@/prisma/client";
// import { UserRole, getHomeRouteForRole, getRoleName } from "@/lib/auth/roles";

// const RegisterSchema = z.object({
//   email: z.string().email("Invalid email"),
//   username: z
//     .string()
//     .min(3, "Username must be at least 3 characters")
//     .regex(
//       /^[a-zA-Z0-9_]+$/,
//       "Username can only contain letters, numbers, and underscores"
//     ),
//   password: z
//     .string()
//     .min(6, "Password must be at least 6 characters")
//     .regex(
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
//       "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
//     ),
//   fullname: z.string().min(2, "Full name must be at least 2 characters"),
//   phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
//   address: z.string().min(1, "Address is required"),
// });

// function determineUserRole(email: string, username: string): UserRole {
//   const emailLower = email.toLowerCase();
//   const usernameLower = username.toLowerCase();

//   const adminPatterns = {
//     email: ["@admin.", "admin@", ".admin@"],
//     username: ["admin_", "_admin", "administrator"],
//     domains: ["admin.com", "admin.net", "admin.org"],
//   };

//   const staffPatterns = {
//     email: ["@staff.", "staff@", ".staff@"],
//     username: ["staff_", "_staff", "employee_"],
//     domains: ["staff.com", "staff.net", "company-staff.com"],
//   };

//   if (
//     adminPatterns.email.some((pattern) => emailLower.includes(pattern)) ||
//     adminPatterns.username.some((pattern) => usernameLower.includes(pattern)) ||
//     adminPatterns.domains.some((domain) => emailLower.endsWith(domain))
//   ) {
//     return UserRole.ADMIN;
//   }

//   if (
//     staffPatterns.email.some((pattern) => emailLower.includes(pattern)) ||
//     staffPatterns.username.some((pattern) => usernameLower.includes(pattern)) ||
//     staffPatterns.domains.some((domain) => emailLower.endsWith(domain))
//   ) {
//     return UserRole.STAFF;
//   }

//   return UserRole.CUSTOMER;
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const validatedData = RegisterSchema.parse(body);

//     const existingUser = await prisma.users.findFirst({
//       where: {
//         OR: [
//           { Email: validatedData.email },
//           { Tentaikhoan: validatedData.username },
//         ],
//       },
//     });

//     if (existingUser) {
//       return NextResponse.json(
//         { error: "Email or username already exists" },
//         { status: 400 }
//       );
//     }

//     const assignedRole = determineUserRole(
//       validatedData.email,
//       validatedData.username
//     );
//     const hashedPassword = await hashPassword(validatedData.password);

//     const user = await prisma.users.create({
//       data: {
//         Email: validatedData.email,
//         Tentaikhoan: validatedData.username,
//         Matkhau: hashedPassword,
//         Hoten: validatedData.fullname,
//         Sdt: validatedData.phone,
//         Diachi: validatedData.address,
//         idRole: assignedRole,
//         Ngaydangky: new Date(),
//         Token: null,
//       },
//       include: {
//         role: true,
//       },
//     });

//     const token = await generateToken({
//       sub: String(user.idUsers),
//       email: user.Email ?? "",
//       role: user.idRole ?? UserRole.CUSTOMER,
//       username: user.Tentaikhoan ?? "",
//       phone: user.Sdt ?? "",
//       address: user.Diachi ?? "",
//     });

//     await prisma.users.update({
//       where: { idUsers: user.idUsers },
//       data: { Token: token },
//     });

//     const finalUserRole = user.idRole ?? UserRole.CUSTOMER;
//     const homeRoute = getHomeRouteForRole(finalUserRole);
//     const roleName = getRoleName(finalUserRole);

//     const response = NextResponse.json({
//       message: `Successfully registered as ${roleName}`,
//       user: {
//         id: user.idUsers,
//         email: user.Email,
//         username: user.Tentaikhoan,
//         fullname: user.Hoten,
//         phone: user.Sdt, // Explicitly include phone
//         address: user.Diachi, // Explicitly include address
//         role: roleName,
//         roleId: finalUserRole,
//       },
//       token,
//       redirectTo: homeRoute,
//     });

//     response.cookies.set("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 60 * 60 * 24, // 24 hours
//     });

//     return response;
//   } catch (error) {
//     console.error("Registration error:", error);

//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         {
//           error: "Invalid data",
//           details: error.errors.map((err) => ({
//             field: err.path.join("."),
//             message: err.message,
//           })),
//         },
//         { status: 400 }
//       );
//     }

//     if (error instanceof Error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json(
//       { error: "An error occurred during registration" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/token";
import prisma from "@/prisma/client";
import { UserRole, getHomeRouteForRole, getRoleName } from "@/lib/auth/roles";

const RegisterSchema = z.object({
  email: z.string().email("Invalid email"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_\.]+$/,
      "Username can only contain letters, numbers, underscores, and dots"
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
    ),
  fullname: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().regex(/^[0-9]{10}$/, "Invalid phone number"),
  address: z.string().min(1, "Address is required"),
});

function determineUserRole(username: string): UserRole {
  if (username.endsWith(".admin")) {
    return UserRole.ADMIN;
  }
  if (username.endsWith(".staff")) {
    return UserRole.STAFF;
  }
  return UserRole.CUSTOMER;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RegisterSchema.parse(body);

    // Kiểm tra user đã tồn tại
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
        { error: "Email or username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(validatedData.password);
    const assignedRole = determineUserRole(validatedData.username);

    const user = await prisma.users.create({
      data: {
        Email: validatedData.email,
        Tentaikhoan: validatedData.username,
        Matkhau: hashedPassword,
        Hoten: validatedData.fullname,
        Sdt: validatedData.phone,
        Diachi: validatedData.address,
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
      phone: user.Sdt ?? "",
      address: user.Diachi ?? "",
    });

    await prisma.users.update({
      where: { idUsers: user.idUsers },
      data: { Token: token },
    });

    const finalUserRole = user.idRole ?? UserRole.CUSTOMER;
    const homeRoute = getHomeRouteForRole(finalUserRole);
    const roleName = getRoleName(finalUserRole);

    const response = NextResponse.json({
      message: `Successfully registered as ${roleName}`,
      user: {
        id: user.idUsers,
        email: user.Email,
        username: user.Tentaikhoan,
        fullname: user.Hoten,
        phone: user.Sdt,
        address: user.Diachi,
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
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);

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

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
