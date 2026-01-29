import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
