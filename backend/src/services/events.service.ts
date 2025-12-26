import { prisma } from '../lib/prisma';
import { uploadService } from './upload.service';

interface CreateEventData {
  date: Date;
  title: string;
  description?: string;
}

interface UpdateEventData {
  date?: Date;
  title?: string;
  description?: string;
}

export const eventsService = {
  async findByUser(userId: string) {
    return prisma.event.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        title: true,
        description: true,
        photoUrl: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        date: true,
        title: true,
        description: true,
        photoUrl: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async create(userId: string, data: CreateEventData, photoFile?: Express.Multer.File) {
    let photoUrl: string | undefined;
    let thumbnailUrl: string | undefined;

    if (photoFile) {
      photoUrl = await uploadService.saveImage(photoFile);
      thumbnailUrl = uploadService.getThumbnailUrl(photoUrl) || undefined;
    }

    return prisma.event.create({
      data: {
        userId,
        date: data.date,
        title: data.title,
        description: data.description,
        photoUrl,
        thumbnailUrl,
      },
      select: {
        id: true,
        date: true,
        title: true,
        description: true,
        photoUrl: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async update(id: string, data: UpdateEventData, photoFile?: Express.Multer.File) {
    const updateData: {
      date?: Date;
      title?: string;
      description?: string;
      photoUrl?: string;
      thumbnailUrl?: string;
    } = {};

    if (data.date) updateData.date = data.date;
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;

    if (photoFile) {
      // Delete old photo if exists
      const existing = await this.findById(id);
      if (existing?.photoUrl) {
        await uploadService.deleteImage(existing.photoUrl);
      }
      updateData.photoUrl = await uploadService.saveImage(photoFile);
      updateData.thumbnailUrl = uploadService.getThumbnailUrl(updateData.photoUrl) || undefined;
    }

    return prisma.event.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        date: true,
        title: true,
        description: true,
        photoUrl: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async delete(id: string) {
    const event = await this.findById(id);
    if (event?.photoUrl) {
      await uploadService.deleteImage(event.photoUrl);
    }
    return prisma.event.delete({ where: { id } });
  },
};
