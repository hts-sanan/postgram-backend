import {
  Controller, Get, Post, Patch, Body, Param, UseGuards, Req,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { mkdirSync } from 'node:fs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ProfilesService } from '../profiles.service.js';
import { CreateProfileDto } from '../dto/create-profile.dto.js';
import { UpdateProfileDto } from '../dto/update-profile.dto.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

mkdirSync('uploads/profile-pictures', { recursive: true });

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('me')
  create(@Req() req: any, @Body() dto: CreateProfileDto) {
    return this.profilesService.create(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return this.profilesService.findMe(req.user.sub);
  }

  @Get(':userId')
  getOne(@Param('userId') userId: string) {
    return this.profilesService.findPublic(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  update(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.profilesService.update(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/profile-pictures',
        filename: (_req, file, callback) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Only JPEG, PNG, or WEBP images are allowed.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadPicture(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    const url = `/uploads/profile-pictures/${file.filename}`;
    return this.profilesService.update(req.user.sub, { profilePictureUrl: url });
  }
}
