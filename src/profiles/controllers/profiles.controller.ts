import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { mkdirSync } from 'node:fs';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { CreateProfileDto } from '../dto/create-profile.dto.js';
import { UpdateProfileDto } from '../dto/update-profile.dto.js';
import { ProfilesService } from '../profiles.service.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

mkdirSync('uploads/profile-pictures', { recursive: true });

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary:
      'Create your profile. Can only be done once per account; firstName/lastName/dateOfBirth become permanent.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('me')
  create(@Req() req: any, @Body() dto: CreateProfileDto) {
    return this.profilesService.create(req.user.sub, dto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Get the logged-in user's own profile." })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return this.profilesService.findMe(req.user.sub);
  }

  @ApiOperation({ summary: "Get any user's public profile by their user ID." })
  @ApiParam({
    name: 'userId',
    description: "The target user's ID.",
    example: 'a1b2c3d4-...',
  })
  @Get(':userId')
  getOne(@Param('userId') userId: string) {
    return this.profilesService.findPublic(userId);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update your bio and/or profile picture URL. First/last name and DOB cannot be changed here.',
  })
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  update(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.profilesService.update(req.user.sub, dto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Upload a new profile picture (JPEG, PNG, or WEBP, max 5MB).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
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
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only JPEG, PNG, or WEBP images are allowed.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async uploadPicture(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    const url = `/uploads/profile-pictures/${file.filename}`;

    return this.profilesService.update(req.user.sub, {
      profilePictureUrl: url,
    });
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete your profile picture.' })
  @UseGuards(JwtAuthGuard)
  @Delete('me/picture')
  removePicture(@Req() req: any) {
    return this.profilesService.removePicture(req.user.sub);
  }
}