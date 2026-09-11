import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PostsController } from './controllers/posts.controller.js';
import { ImageStorageService } from './image-storage.service.js';
import { PostsService } from './posts.service.js';

@Module({
  imports: [AuthModule],
  controllers: [PostsController],
  providers: [PostsService, ImageStorageService],
  exports: [PostsService],
})
export class PostsModule {}