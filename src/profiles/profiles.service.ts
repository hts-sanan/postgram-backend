import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { CreateProfileDto } from './dto/create-profile.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { unlink } from 'node:fs/promises';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(profile: any) {
  return {
    userId: profile.userId,
    username: profile.user.username,
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: profile.dateOfBirth,
    bio: profile.bio,
    profilePictureUrl: profile.profilePictureUrl,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

  async create(userId: string, dto: CreateProfileDto) {
    const existing = await this.prisma.profile.findUnique({ where: { userId } });
    if (existing) {
      throw new ConflictException({
        statusCode: 409,
        code: 'CONFLICT',
        message: 'Profile already exists for this user.',
      });
    }

    const profile = await this.prisma.profile.create({
        data: {
        userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: new Date(dto.dateOfBirth),
      },
      include: { user: true },
    });

    return this.toResponse(profile);
  }

  async findMe(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) throw new NotFoundException('Profile not found.');
    return this.toResponse(profile);
  }

  async findPublic(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) throw new NotFoundException('Profile not found.');
    return this.toResponse(profile);
  }

  async update(userId: string, dto: UpdateProfileDto) {
    const existing = await this.prisma.profile.findUnique({ where: { userId } });
    if (!existing) throw new NotFoundException('Profile not found.');

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        bio: dto.bio,
        profilePictureUrl: dto.profilePictureUrl,
      },
      include: { user: true },

    });

    return this.toResponse(profile);
  }

  async removePicture(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });

    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }

    if (profile.profilePictureUrl) {
      const filePath = profile.profilePictureUrl.replace('/uploads/', 'uploads/');
      try {
        await unlink(filePath);
      } catch {}
    }

    const updatedProfile = await this.prisma.profile.update({
      where: { userId },
      data: {
        profilePictureUrl: null,
      },
      include: { user: true },

    });

    return this.toResponse(updatedProfile);
  }
}