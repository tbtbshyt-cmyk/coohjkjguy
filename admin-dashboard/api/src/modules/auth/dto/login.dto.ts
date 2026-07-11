import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @IsEmail({}, { message: 'بريد إلكتروني غير صالح' })
  email!: string;

  @IsString()
  @MinLength(4, { message: 'كلمة المرور قصيرة جداً' })
  password!: string;

  device?: string;
}