import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string) {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findFirst({
      where: {
        username,
        deletedAt: null,
      },
    });
  }

  async create(username: string, passwordHash: string) {
    return this.prisma.user.create({
      data: {
        username,
        passwordHash,
      },
    });
  }

  async softDelete(userId: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: new Date(),
        status: 'DELETED',
      },
    });
  }
}