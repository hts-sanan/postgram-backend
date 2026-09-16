import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Your username.', example: 'sanan_hts' })
  @IsString()
  @Length(3, 50)
  username!: string;

  @ApiProperty({ description: 'Your password.', example: 'SecurePass123!' })
  @IsString()
  @Length(8, 128)
  password!: string;
}
