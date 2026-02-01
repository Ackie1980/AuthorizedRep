import { type UserRole } from '@prisma/client';
import { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    manufacturerId: string | null;
    image?: string | null;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      manufacturerId: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    manufacturerId: string | null;
    image?: string | null;
  }
}
