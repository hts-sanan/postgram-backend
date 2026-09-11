import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CreatePostDto } from '../dto/create-post.dto.js';
import { UpdatePostDto } from '../dto/update-post.dto.js';
import { PostsService } from '../posts.service.js';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: any,
  ) {
    return this.postsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      userId: req?.user?.sub,
    });
  }

  @Get(':postId')
  findOne(@Param('postId') postId: string, @Req() req: any) {
    return this.postsService.findOne(postId, req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  create(
    @Body() dto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: any,
  ) {
    return this.postsService.create(req.user.sub, dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':postId')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  update(
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: any,
  ) {
    return this.postsService.update(
      postId,
      req.user.sub,
      dto,
      file,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  remove(@Param('postId') postId: string, @Req() req: any) {
    return this.postsService.remove(postId, req.user.sub);
  }
}