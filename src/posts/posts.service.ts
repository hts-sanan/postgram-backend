import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  private getPostType(content?: string | null, imageUrl?: string | null) {
    const hasContent = !!content?.trim();
    const hasImage = !!imageUrl;

    if (hasContent && hasImage) {
      return 'TEXT_IMAGE';
    }

    if (hasImage) {
      return 'IMAGE';
    }

    if (hasContent) {
      return 'TEXT';
    }

    throw new BadRequestException(
      'Post must contain content, an image, or both',
    );
  }

  private async getPostResponse(postId: string, userId?: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    let hasLiked = false;

    if (userId) {
      const like = await this.prisma.like.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });

      hasLiked = !!like;
    }

    return {
      id: post.id,
      userId: post.userId,
      postType: post.postType,
      content: post.content,
      imageUrl: post.imageUrl,
      visibility: post.visibility,
      postStatus: post.postStatus,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      hasLiked,
    };
  }

  async create(userId: string, dto: CreatePostDto) {
    const content = dto.content?.trim() || null;
    const imageUrl = dto.imageUrl || null;

    const postType = this.getPostType(content, imageUrl);

    const post = await this.prisma.post.create({
      data: {
        userId,
        postType,
        content,
        imageUrl,
        visibility: dto.visibility || 'PUBLIC',
        postStatus: 'POSTED',
      },
    });

    return {
      id: post.id,
      userId: post.userId,
      postType: post.postType,
      content: post.content,
      imageUrl: post.imageUrl,
      visibility: post.visibility,
      postStatus: post.postStatus,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likeCount: 0,
      commentCount: 0,
      hasLiked: false,
    };
  }

  async findAll(options: {
    page: number;
    limit: number;
    userId?: string;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      postStatus: 'POSTED',
    };

    const [posts, totalItems] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      this.prisma.post.count({
        where,
      }),
    ]);

    const hasLikedIds = new Set<string>();

    if (options.userId && posts.length > 0) {
      const likes = await this.prisma.like.findMany({
        where: {
          userId: options.userId,
          postId: {
            in: posts.map((post) => post.id),
          },
        },
        select: {
          postId: true,
        },
      });

      likes.forEach((like) => hasLikedIds.add(like.postId));
    }

    const data = posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      postType: post.postType,
      content: post.content,
      imageUrl: post.imageUrl,
      visibility: post.visibility,
      postStatus: post.postStatus,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      hasLiked: hasLikedIds.has(post.id),
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOne(postId: string, userId?: string) {
    return this.getPostResponse(postId, userId);
  }

  async update(postId: string, userId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        deletedAt: null,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to update this post',
      );
    }

    const content =
      dto.content !== undefined
        ? dto.content.trim() || null
        : post.content;

    const imageUrl =
      dto.imageUrl !== undefined
        ? dto.imageUrl || null
        : post.imageUrl;

    const postType = this.getPostType(content, imageUrl);

    await this.prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        content,
        imageUrl,
        postType,
        ...(dto.visibility !== undefined
          ? { visibility: dto.visibility }
          : {}),
      },
    });

    return this.getPostResponse(postId, userId);
  }

  async remove(postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        deletedAt: null,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this post',
      );
    }

    await this.prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Post deleted successfully',
    };
  }
}