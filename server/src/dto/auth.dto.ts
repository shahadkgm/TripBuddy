import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterUserDTO {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
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
