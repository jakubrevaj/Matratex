import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Material } from './entities/material.entity'; // <- uprav podľa názvu súboru

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
  ) {}

  create(createMaterialDto: CreateMaterialDto) {
    const material = this.materialRepo.create(createMaterialDto);
    return this.materialRepo.save(material);
  }

  findAll() {
    return this.materialRepo.find();
  }

  findOne(id: number) {
    return this.materialRepo.findOneBy({ id });
  }

  update(id: number, updateMaterialDto: UpdateMaterialDto) {
    return this.materialRepo.update(id, updateMaterialDto);
  }

  async remove(id: number) {
    await this.materialRepo.delete(id);
    return { message: `Material ${id} removed` };
  }
}
