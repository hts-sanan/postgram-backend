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
import { CommentsService } from '../comments.service.js';
import { CreateCommentDto } from '../dto/create-comment.dto.js';
import { UpdateCommentDto } from '../dto/update-comment.dto.js';

@Controller()
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('posts/:postId/comments')
  create(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.commentsService.create(
      postId,
      req.user.sub,
      dto,
    );
  }

  @Get('posts/:postId/comments')
  findAll(
    @Param('postId') postId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.commentsService.findAll(
      postId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('comments/:commentId')
  update(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: any,
  ) {
    return this.commentsService.update(
      commentId,
      req.user.sub,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  remove(
    @Param('commentId') commentId: string,
    @Req() req: any,
  ) {
    return this.commentsService.remove(
      commentId,
      req.user.sub,
    );
  }
}