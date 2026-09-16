import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment text.', example: 'Great post!', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;

  @ApiPropertyOptional({
    description: 'ID of the comment being replied to, if this is a reply.',
    example: 'a1b2c3d4-...',
  })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
