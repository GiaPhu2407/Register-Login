import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
  
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/token';
import prisma from '@/prisma/client';

const LoginSchema = z.object({
  usernameOrEmail: z.string(),
  password: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = LoginSchema.parse(body);

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { Email: validatedData.usernameOrEmail },
          { Tentaikhoan: validatedData.usernameOrEmail }
        ]
      },
      include: {
        role: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Người dùng không tồn tại' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(
      validatedData.password,
      user.Matkhau || ''
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user.idUsers,
      email: user.Email || '',
      role: user.idRole ?? 2
    });

    await prisma.users.update({
      where: { idUsers: user.idUsers },
      data: { Token: token }
    });

    const response = NextResponse.json({
      user: {
        id: user.idUsers,
        email: user.Email,
        username: user.Tentaikhoan,
        role: user.role?.Tennguoidung || 'user'
      },
      token
    });

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Lỗi trong quá trình đăng nhập' },
      { status: 500 }
    );
  }
}