import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { createSession, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { login, password } = await request.json();

  if (!login || !password) {
    return NextResponse.json({ error: 'Введите логин и пароль' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { login } });
  if (!user) {
    return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
  }

  const valid = await bcryptjs.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
  }

  const token = await createSession({
    userId: user.id,
    login: user.login,
    fullName: user.fullName,
    role: user.role,
  });

  const response = NextResponse.json({ success: true, fullName: user.fullName });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  return response;
}
