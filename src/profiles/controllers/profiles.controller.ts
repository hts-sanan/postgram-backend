import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ProfilesService } from '../profiles.service.js';
import { CreateProfileDto } from '../dto/create-profile.dto.js';
import { UpdateProfileDto } from '../dto/update-profile.dto.js';

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
}
