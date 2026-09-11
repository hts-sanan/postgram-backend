import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;
}
