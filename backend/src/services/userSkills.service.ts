import { prisma } from '../lib/prisma';
import { SkillStatus } from '@prisma/client';
import { calculateAvatarLevel } from '../utils/avatar';

export interface UserSkillsSummary {
  avatarLevel: number;
  summary: {
    acquired: number;
    inProgress: number;
    pendingValidation: number;
    rejected: number;
  };
  skills: Array<{
    id: string;
    skillId: string;
    status: SkillStatus;
    requestedAt: Date;
    validatedAt: Date | null;
    rejectionReason: string | null;
    skill: {
      id: string;
      name: string;
      description: string;
      iconName: string;
      category: {
        id: string;
        name: string;
        domain: {
          id: string;
          name: string;
        };
      };
    };
  }>;
}

export const userSkillsService = {
  /**
   * Get user's skills with summary
   */
  async getUserSkillsSummary(userId: string): Promise<UserSkillsSummary> {
    const [user, skills, counts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { avatarLevel: true },
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
      prisma.userSkill.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
    ]);

    const summary = {
      acquired: 0,
      inProgress: 0,
      pendingValidation: 0,
      rejected: 0,
    };

    counts.forEach((c) => {
      switch (c.status) {
        case 'ACQUIRED':
          summary.acquired = c._count;
          break;
        case 'IN_PROGRESS':
          summary.inProgress = c._count;
          break;
        case 'PENDING_VALIDATION':
          summary.pendingValidation = c._count;
          break;
        case 'REJECTED':
          summary.rejected = c._count;
          break;
      }
    });

    return {
      avatarLevel: user?.avatarLevel || 1,
      summary,
      skills: skills.map((s) => ({
        id: s.id,
        skillId: s.skillId,
        status: s.status,
        requestedAt: s.requestedAt,
        validatedAt: s.validatedAt,
        rejectionReason: s.rejectionReason,
        skill: {
          id: s.skill.id,
          name: s.skill.name,
          description: s.skill.description,
          iconName: s.skill.iconName,
          category: {
            id: s.skill.category.id,
            name: s.skill.category.name,
            domain: {
              id: s.skill.category.domain.id,
              name: s.skill.category.domain.name,
            },
          },
        },
      })),
    };
  },

  /**
   * Add a skill to user's profile
   */
  async addSkillToUser(userId: string, skillId: string, status: 'IN_PROGRESS' | 'PENDING_VALIDATION') {
    // Check if skill exists
    const skill = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill || !skill.isActive) {
      throw new Error('Competence non trouvee ou inactive');
    }

    // Check if already added
    const existing = await prisma.userSkill.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });
    if (existing) {
      throw new Error('Competence deja ajoutee');
    }

    return prisma.userSkill.create({
      data: {
        userId,
        skillId,
        status,
      },
      include: {
        skill: {
          include: {
            category: {
              include: { domain: true },
            },
          },
        },
      },
    });
  },

  /**
   * Update user skill status (user can only set IN_PROGRESS or PENDING_VALIDATION)
   */
  async updateUserSkillStatus(userId: string, skillId: string, status: 'IN_PROGRESS' | 'PENDING_VALIDATION') {
    const userSkill = await prisma.userSkill.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });

    if (!userSkill) {
      throw new Error('Competence non trouvee dans votre profil');
    }

    // User cannot change status if already validated or rejected
    if (userSkill.status === 'ACQUIRED' || userSkill.status === 'REJECTED') {
      throw new Error('Impossible de modifier une competence deja evaluee');
    }

    return prisma.userSkill.update({
      where: { userId_skillId: { userId, skillId } },
      data: { status },
    });
  },

  /**
   * Remove a skill from user's profile
   */
  async removeSkillFromUser(userId: string, skillId: string) {
    const userSkill = await prisma.userSkill.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });

    if (!userSkill) {
      throw new Error('Competence non trouvee dans votre profil');
    }

    // Cannot remove acquired skills
    if (userSkill.status === 'ACQUIRED') {
      throw new Error('Impossible de retirer une competence acquise');
    }

    return prisma.userSkill.delete({
      where: { userId_skillId: { userId, skillId } },
    });
  },

  /**
   * Approve a skill (admin only) - updates status and avatar level
   */
  async approveSkill(userSkillId: string, adminId: string) {
    return prisma.$transaction(async (tx) => {
      // Update skill status
      const userSkill = await tx.userSkill.update({
        where: { id: userSkillId },
        data: {
          status: 'ACQUIRED',
          validatedAt: new Date(),
          validatedById: adminId,
        },
      });

      // Count acquired skills
      const acquiredCount = await tx.userSkill.count({
        where: {
          userId: userSkill.userId,
          status: 'ACQUIRED',
        },
      });

      // Update avatar level
      const avatarLevel = calculateAvatarLevel(acquiredCount);
      await tx.user.update({
        where: { id: userSkill.userId },
        data: { avatarLevel },
      });

      return userSkill;
    });
  },

  /**
   * Reject a skill (admin only)
   */
  async rejectSkill(userSkillId: string, adminId: string, reason: string) {
    return prisma.userSkill.update({
      where: { id: userSkillId },
      data: {
        status: 'REJECTED',
        validatedAt: new Date(),
        validatedById: adminId,
        rejectionReason: reason,
      },
    });
  },

  /**
   * Get pending validations (admin)
   */
  async getPendingValidations() {
    return prisma.userSkill.findMany({
      where: { status: 'PENDING_VALIDATION' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true },
        },
        skill: {
          include: {
            category: {
              include: { domain: true },
            },
          },
        },
      },
      orderBy: { requestedAt: 'asc' },
    });
  },
};
