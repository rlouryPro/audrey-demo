import { prisma } from '../lib/prisma';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export interface LoginResult {
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: 'USER' | 'ADMIN';
    avatarLevel: number;
  };
  token: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResult> {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarLevel: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error('Identifiant ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new Error('Ce compte est desactive');
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Identifiant ou mot de passe incorrect');
    }

    const token = generateToken({ userId: user.id, role: user.role });

    return {
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarLevel: user.avatarLevel,
      },
      token,
    };
  },

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarLevel: true,
        isActive: true,
        createdAt: true,
      },
    });
  },
};
