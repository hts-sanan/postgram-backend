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
  UseGuards,
} from '@nestjs/common';

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
    const userId = req?.user?.sub;

    return this.postsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      userId,
    });
  }

  @Get(':postId')
  findOne(@Param('postId') postId: string, @Req() req: any) {
    return this.postsService.findOne(postId, req?.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePostDto, @Req() req: any) {
    return this.postsService.create(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':postId')
  update(
    @Param('postId') postId: string,
    @Body() dto: UpdatePostDto,
    @Req() req: any,
  ) {
    return this.postsService.update(postId, req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  remove(@Param('postId') postId: string, @Req() req: any) {
    return this.postsService.remove(postId, req.user.sub);
  }
}