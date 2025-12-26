import { prisma } from '../lib/prisma';
import { hashPassword } from '../utils/password';
import { Role } from '@prisma/client';

interface CreateUserData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: Role;
  isActive?: boolean;
  password?: string;
}

interface UserFilters {
  role?: Role;
  isActive?: boolean;
}

export const usersService = {
  async findAll(filters: UserFilters = {}) {
    const where: { role?: Role; isActive?: boolean } = {};
    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    return prisma.user.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarLevel: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            events: true,
            userSkills: true,
          },
        },
      },
    });
  },

  async create(data: CreateUserData) {
    const passwordHash = await hashPassword(data.password);

    return prisma.user.create({
      data: {
        username: data.username,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
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

  async update(id: string, data: UpdateUserData) {
    const updateData: {
      firstName?: string;
      lastName?: string;
      role?: Role;
      isActive?: boolean;
      passwordHash?: string;
    } = {};

    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.role) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) updateData.passwordHash = await hashPassword(data.password);

    return prisma.user.update({
      where: { id },
      data: updateData,
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

  async getPortfolio(userId: string) {
    const [user, events, skillsSummary] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatarLevel: true,
          createdAt: true,
        },
      }),
      prisma.event.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
      prisma.userSkill.findMany({
        where: { userId },
        include: {
          skill: {
            include: {
              category: {
                include: { domain: true },
              },
            },
          },
        },
        orderBy: { requestedAt: 'desc' },
      }),
    ]);

    if (!user) return null;

    const summary = {
      acquired: skillsSummary.filter((s) => s.status === 'ACQUIRED').length,
      inProgress: skillsSummary.filter((s) => s.status === 'IN_PROGRESS').length,
      pendingValidation: skillsSummary.filter((s) => s.status === 'PENDING_VALIDATION').length,
      rejected: skillsSummary.filter((s) => s.status === 'REJECTED').length,
    };

    return {
      user,
      events,
      skills: {
        avatarLevel: user.avatarLevel,
        summary,
        skills: skillsSummary,
      },
    };
  },
};
