import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { ImageStorageService } from './image-storage.service.js';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageStorage: ImageStorageService,
  ) {}

  private getPostType(
    content?: string | null,
    imageUrl?: string | null,
  ) {
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

  private validateImage(file?: Express.Multer.File) {
    if (!file) {
      return;
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are allowed',
      );
    }
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

  async create(
    userId: string,
    dto: CreatePostDto,
    file?: Express.Multer.File,
  ) {
    this.validateImage(file);

    const content = dto.content?.trim() || null;
    let imageUrl: string | null = null;

    if (file) {
      imageUrl = await this.imageStorage.save(file);
    }

    try {
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
    } catch (error) {
      if (imageUrl) {
        await this.imageStorage.delete(imageUrl);
      }

      throw error;
    }
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

  async update(
    postId: string,
    userId: string,
    dto: UpdatePostDto,
    file?: Express.Multer.File,
  ) {
    this.validateImage(file);

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

    if (dto.removeImage && file) {
      throw new BadRequestException(
        'Choose either a new image or removeImage',
      );
    }

    const content =
      dto.content !== undefined
        ? dto.content.trim() || null
        : post.content;

    let imageUrl = post.imageUrl;
    let newImageUrl: string | null = null;

    try {
      if (file) {
        newImageUrl = await this.imageStorage.save(file);
        imageUrl = newImageUrl;
      } else if (dto.removeImage) {
        imageUrl = null;
      }

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

      if (
        post.imageUrl &&
        post.imageUrl !== imageUrl
      ) {
        await this.imageStorage.delete(post.imageUrl);
      }

      return this.getPostResponse(postId, userId);
    } catch (error) {
      if (newImageUrl) {
        await this.imageStorage.delete(newImageUrl);
      }

      throw error;
    }
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

    if (post.imageUrl) {
      await this.imageStorage.delete(post.imageUrl);
    }

    return {
      message: 'Post deleted successfully',
    };
  }
}