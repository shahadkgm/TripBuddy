import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class RegisterUserDTO {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  @IsOptional()
  @IsEnum(['user', 'guide', 'admin'])
  role?: 'user' | 'guide' | 'admin';

  @IsOptional()
  @IsBoolean()
  isGoogleUser?: boolean;

  @IsOptional()
  @IsBoolean()
  isblocked?: boolean;
}

export class LoginDTO {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
