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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CommentsService } from '../comments.service.js';
import { CreateCommentDto } from '../dto/create-comment.dto.js';
import { UpdateCommentDto } from '../dto/update-comment.dto.js';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
  ) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add a comment (or reply, via parentCommentId) to a post.' })
  @ApiParam({ name: 'postId', example: 'a1b2c3d4-...' })
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

  @ApiOperation({ summary: 'List top-level comments for a post (paginated), each with its replies nested.' })
  @ApiParam({ name: 'postId', example: 'a1b2c3d4-...' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
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

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Edit your own comment. Owner only.' })
  @ApiParam({ name: 'commentId', example: 'a1b2c3d4-...' })
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

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete your own comment (soft delete). Owner only.' })
  @ApiParam({ name: 'commentId', example: 'a1b2c3d4-...' })
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
