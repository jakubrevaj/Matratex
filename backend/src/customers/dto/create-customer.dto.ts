import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsOptional()
  @MaxLength(10)
  ico?: string;

  @IsString()
  @MaxLength(255)
  podnik: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(255)
  adresa: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefon?: string;

  @IsString()
  @IsOptional()
  dic?: string;

  @IsString()
  @IsOptional()
  icdph?: string;
}
