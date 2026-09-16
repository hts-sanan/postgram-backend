import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: 'Unique username. Letters, numbers, underscores, dots, and hyphens only.',
    example: 'sanan_hts',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9_.-]+$/)
  username!: string;

  @ApiProperty({
    description: 'Account password.',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @Length(8, 128)
  password!: string;
}
