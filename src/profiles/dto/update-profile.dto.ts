import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Short bio text.',
    example: 'Building Postgram 🚀',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bio?: string;

  @ApiPropertyOptional({
    description: 'URL of the profile picture (usually set automatically via the upload endpoint).',
    example: 'http://localhost:3000/uploads/profile-pictures/abc123.png',
  })
  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;
}
