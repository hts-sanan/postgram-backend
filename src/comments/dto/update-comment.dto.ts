import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ description: 'Updated comment text.', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}
