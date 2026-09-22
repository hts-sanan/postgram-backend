import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, Length, Matches, Validate } from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNotFutureDate', async: false })
class IsNotFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (!value) return false;

    const inputDate = new Date(`${value}T00:00:00`);
    const today = new Date();

    today.setHours(23, 59, 59, 999);

    return inputDate <= today;
  }

  defaultMessage() {
    return 'dateOfBirth cannot be in the future.';
  }
}

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

  @ApiProperty({
    description: 'First name.',
    example: 'Hanan',
  })
  @IsString()
  @Length(1, 100)
  firstName!: string;

  @ApiProperty({
    description: 'Last name.',
    example: 'A',
  })
  @IsString()
  @Length(1, 100)
  lastName!: string;

  @ApiProperty({
    description: 'Date of birth in ISO date format.',
    example: '2000-01-15',
  })
  @IsDateString()
  @Validate(IsNotFutureDateConstraint)
  dateOfBirth!: string;
}