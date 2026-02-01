'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
};

export type RegisterState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string;
};

export async function login(
  prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid credentials',
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { message: 'Invalid email or password' };
        default:
          return { message: 'Something went wrong. Please try again.' };
      }
    }
    throw error;
  }

  const callbackUrl = formData.get('callbackUrl') as string;
  redirect(callbackUrl || '/dashboard');
}

export async function register(
  prevState: RegisterState | undefined,
  formData: FormData
): Promise<RegisterState> {
  const validatedFields = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fix the errors below',
    };
  }

  const { name, email, password } = validatedFields.data;

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      errors: { email: ['An account with this email already exists'] },
      message: 'Registration failed',
    };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Split name into firstName and lastName
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || name;
  const lastName = nameParts.slice(1).join(' ') || nameParts[0];

  // Create user (default role is CUSTOMER)
  try {
    await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role: UserRole.CUSTOMER,
      },
    });
  } catch {
    return {
      message: 'Failed to create account. Please try again.',
    };
  }

  // Sign in the new user
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: 'Account created but failed to sign in. Please log in.' };
    }
    throw error;
  }

  redirect('/dashboard');
}

export async function logout() {
  await signOut({ redirectTo: '/login' });
}
