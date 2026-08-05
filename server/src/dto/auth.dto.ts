import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
  MinLength,
  IsNotEmpty,
  MaxLength,
  Matches,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// Custom validator to calculate password strength score (mimics client-side calculatePasswordStrength)
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          let score = 0;
          if (value.length >= 8) score++;
          if (/[A-Z]/.test(value)) score++;
          if (/[a-z]/.test(value)) score++;
          if (/[0-9]/.test(value)) score++;
          if (/[^A-Za-z0-9]/.test(value)) score++;
          return score >= 3;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Your password is too weak';
        },
      },
    });
  };
}

export class RegisterUserDTO {
  @IsString()
  @MaxLength(20, { message: 'Name cannot exceed 20 characters' })
  @Matches(/^[A-Za-z\s]*$/, { message: 'Name must contain only alphabets' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'Password must include at least one letter and one number' })
  @IsStrongPassword({ message: 'Your password is too weak' })
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
