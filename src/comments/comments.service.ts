import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    postId: string,
    userId: string,
    dto: CreateCommentDto,
  ) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        deletedAt: null,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (dto.parentCommentId) {
      const parentComment = await this.prisma.comment.findFirst({
        where: {
          id: dto.parentCommentId,
          postId,
          deletedAt: null,
        },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        userId,
        content: dto.content,
        parentCommentId: dto.parentCommentId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return {
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      username: comment.user.username,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      deletedAt: comment.deletedAt,
    };
  }

  async findAll(
    postId: string,
    page = 1,
    limit = 20,
  ) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        deletedAt: null,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where: {
          postId,
          parentCommentId: null,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'asc',
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          replies: {
            where: {
              deletedAt: null,
            },
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.comment.count({
        where: {
          postId,
          parentCommentId: null,
          deletedAt: null,
        },
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      comments: comments.map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        userId: comment.userId,
        username: comment.user.username,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        deletedAt: comment.deletedAt,
        replies: comment.replies.map((reply) => ({
          id: reply.id,
          postId: reply.postId,
          userId: reply.userId,
          username: reply.user.username,
          content: reply.content,
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
          deletedAt: reply.deletedAt,
        })),
      })),
    };
  }

  async update(
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        deletedAt: null,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own comments',
      );
    }

    const updatedComment = await this.prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content: dto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return {
      id: updatedComment.id,
      postId: updatedComment.postId,
      userId: updatedComment.userId,
      username: updatedComment.user.username,
      content: updatedComment.content,
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt,
      deletedAt: updatedComment.deletedAt,
    };
  }

  async remove(
    commentId: string,
    userId: string,
  ) {
    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        deletedAt: null,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own comments',
      );
    }

    await this.prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Comment deleted successfully',
    };
  }
}