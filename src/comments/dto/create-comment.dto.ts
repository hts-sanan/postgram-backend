import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
