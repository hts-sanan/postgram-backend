import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * @file Prisma service.
 * @description Provides a shared Prisma Client instance for database access across all modules.
 *
 * @author HTS Development Team
 * @created 2026-09-10
 * @updated 2026-09-10
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
