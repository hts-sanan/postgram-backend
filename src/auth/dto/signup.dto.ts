import { IsString, Length, Matches } from 'class-validator';

export class SignupDto {
  @IsString()
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9_.-]+$/)
  username!: string;

  @IsString()
  @Length(8, 128)
  password!: string;
}