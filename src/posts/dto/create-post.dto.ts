import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiPropertyOptional({
    description: 'Post text. At least one of content or an image is required.',
    example: 'My first post on Postgram!',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @ApiPropertyOptional({
    description: 'Who can see this post.',
    enum: ['PUBLIC', 'PRIVATE'],
    default: 'PUBLIC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['PUBLIC', 'PRIVATE'])
  visibility?: string;
}
