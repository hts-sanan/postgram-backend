import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LikesController } from './controllers/likes.controller.js';
import { LikesService } from './likes.service.js';

@Module({
  imports: [AuthModule],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}