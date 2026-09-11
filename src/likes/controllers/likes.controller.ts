import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { LikesService } from '../likes.service.js';

@Controller('posts/:postId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  like(
    @Param('postId') postId: string,
    @Req() req: any,
  ) {
    return this.likesService.likePost(
      postId,
      req.user.sub,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  unlike(
    @Param('postId') postId: string,
    @Req() req: any,
  ) {
    return this.likesService.unlikePost(
      postId,
      req.user.sub,
    );
  }

  @Get()
  getLikes(@Param('postId') postId: string) {
    return this.likesService.getLikes(postId);
  }
}