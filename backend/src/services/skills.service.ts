import { prisma } from '../lib/prisma';

export const skillsService = {
  /**
   * Get full skills hierarchy (domains > categories > skills)
   */
  async getHierarchy(includeInactive = false) {
    return prisma.domain.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        categories: {
          orderBy: { displayOrder: 'asc' },
          include: {
            skills: {
              where: includeInactive ? {} : { isActive: true },
              orderBy: { displayOrder: 'asc' },
              select: {
                id: true,
                name: true,
                description: true,
                iconName: true,
                displayOrder: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Get a single domain by ID
   */
  async getDomainById(id: string) {
    return prisma.domain.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            skills: true,
          },
        },
      },
    });
  },

  /**
   * Create a new domain
   */
  async createDomain(data: { name: string; description?: string; displayOrder?: number }) {
    return prisma.domain.create({
      data,
    });
  },

  /**
   * Update a domain
   */
  async updateDomain(id: string, data: { name?: string; description?: string; displayOrder?: number }) {
    return prisma.domain.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a domain (cascade deletes categories and skills)
   */
  async deleteDomain(id: string) {
    return prisma.domain.delete({ where: { id } });
  },

  /**
   * Create a new category
   */
  async createCategory(data: { domainId: string; name: string; description?: string; displayOrder?: number }) {
    return prisma.category.create({
      data,
    });
  },

  /**
   * Update a category
   */
  async updateCategory(id: string, data: { name?: string; description?: string; displayOrder?: number }) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a category (cascade deletes skills)
   */
  async deleteCategory(id: string) {
    return prisma.category.delete({ where: { id } });
  },

  /**
   * Create a new skill
   */
  async createSkill(data: {
    categoryId: string;
    name: string;
    description: string;
    iconName: string;
    displayOrder?: number;
  }) {
    return prisma.skill.create({
      data,
    });
  },

  /**
   * Update a skill
   */
  async updateSkill(
    id: string,
    data: { name?: string; description?: string; iconName?: string; displayOrder?: number; isActive?: boolean }
  ) {
    return prisma.skill.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a skill
   */
  async deleteSkill(id: string) {
    return prisma.skill.delete({ where: { id } });
  },
};
