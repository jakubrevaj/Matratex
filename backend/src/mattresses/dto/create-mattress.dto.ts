import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateMattressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
