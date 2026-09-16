import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { LikesService } from '../likes.service.js';

@ApiTags('Likes')
@ApiParam({ name: 'postId', example: 'a1b2c3d4-...' })
@Controller('posts/:postId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Like a post. Safe to call more than once (no duplicate likes).' })
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

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove your like from a post.' })
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

  @ApiOperation({ summary: 'List everyone who liked this post.' })
  @Get()
  getLikes(@Param('postId') postId: string) {
    return this.likesService.getLikes(postId);
  }
}
