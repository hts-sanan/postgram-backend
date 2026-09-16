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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CreatePostDto } from '../dto/create-post.dto.js';
import { UpdatePostDto } from '../dto/update-post.dto.js';
import { PostsService } from '../posts.service.js';

const postImageUploadBody = {
  schema: {
    type: 'object',
    properties: {
      content: { type: 'string', example: 'My first post!' },
      visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE'] },
      image: { type: 'string', format: 'binary', description: 'Optional image (JPEG/PNG/WEBP, max 5MB).' },
    },
  },
};

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'List posts (paginated), newest first.' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
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

  @ApiOperation({ summary: 'Get a single post by ID.' })
  @ApiParam({ name: 'postId', example: 'a1b2c3d4-...' })
  @Get(':postId')
  findOne(@Param('postId') postId: string, @Req() req: any) {
    return this.postsService.findOne(postId, req?.user?.sub);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a post. Requires text content, an image, or both.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(postImageUploadBody)
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

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update your own post. Owner only.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(postImageUploadBody)
  @ApiParam({ name: 'postId', example: 'a1b2c3d4-...' })
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

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete your own post (soft delete). Owner only.' })
  @ApiParam({ name: 'postId', example: 'a1b2c3d4-...' })
  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  remove(@Param('postId') postId: string, @Req() req: any) {
    return this.postsService.remove(postId, req.user.sub);
  }
}
