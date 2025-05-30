import { PartialType } from '@nestjs/mapped-types';
import { CreateMattressDto } from './create-mattress.dto';

export class UpdateMattressDto extends PartialType(CreateMattressDto) {}
