import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email!: string;

  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @MaxLength(128, { message: 'Password must be at most 128 characters long.' })
  // Simple strength requirement: at least one letter and one number
  @IsNotEmpty({ message: 'Password is required.' })
  password!: string;

  @IsNotEmpty({ message: 'First name is required.' })
  @MaxLength(50, { message: 'First name must be at most 50 characters long.' })
  firstName!: string;

  @IsNotEmpty({ message: 'Last name is required.' })
  @MaxLength(50, { message: 'Last name must be at most 50 characters long.' })
  lastName!: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required.' })
  password!: string;
}


