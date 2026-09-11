import { IsString, IsNotEmpty, MaxLength, IsDateString } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsDateString()
  dateOfBirth: string;
}
