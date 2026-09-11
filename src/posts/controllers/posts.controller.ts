import { Body, Controller, Get, Post, Patch, Delete, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CreatePostDto } from '../dto/create-post.dto.js';
import { UpdatePostDto } from '../dto/update-post.dto.js';

@Controller('posts')
export class PostsController {
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    // TODO: wire to PostsService once schema is confirmed
    return { data: [], pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 } };
  }

  @Get(':postId')
  findOne(@Param('postId') postId: string) {
    // TODO: wire to PostsService
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePostDto, @Req() req: any) {
    // TODO: wire to PostsService
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':postId')
  update(@Param('postId') postId: string, @Body() dto: UpdatePostDto, @Req() req: any) {
    // TODO: wire to PostsService, enforce owner-only
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  remove(@Param('postId') postId: string, @Req() req: any) {
    // TODO: wire to PostsService, enforce owner-only
  }
}
