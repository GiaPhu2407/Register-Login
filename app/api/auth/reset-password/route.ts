import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/prisma/client";

const UpdateProfileSchema = z.object({
  username: z.string().min(2, "Username phải có ít nhất 2 ký tự"),
  fullname: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
});

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để thực hiện thao tác này" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Received data:", body); // Log để debug

    const validatedData = UpdateProfileSchema.parse(body);

    const user = await prisma.users.findFirst({
      where: { Token: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin người dùng" },
        { status: 404 }
      );
    }

    // Kiểm tra username đã tồn tại chưa (nếu username thay đổi)
    if (validatedData.username !== user.Tentaikhoan) {
      const existingUser = await prisma.users.findFirst({
        where: { Tentaikhoan: validatedData.username },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username đã tồn tại" },
          { status: 400 }
        );
      }
    }

    // Cập nhật thông tin
    const updatedUser = await prisma.users.update({
      where: { idUsers: user.idUsers },
      data: {
       Tentaikhoan: validatedData.username,
        Hoten: validatedData.fullname,
        Sdt: validatedData.phone,
        Diachi: validatedData.address,
      },
    });

    return NextResponse.json({
      message: "Cập nhật thông tin thành công",
      user: {
        username: updatedUser.Tentaikhoan,
        fullname: updatedUser.Hoten,
        phone: updatedUser.Sdt,
        address: updatedUser.Diachi,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error instanceof z.ZodError) {
      const errorDetails = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      console.log("Validation errors:", errorDetails); // Log để debug

      return NextResponse.json(
        {
          error: "Dữ liệu không hợp lệ",
          details: errorDetails,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Đã có lỗi xảy ra khi cập nhật thông tin" },
      { status: 500 }
    );
  }
}
