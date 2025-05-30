import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mattress } from './entities/mattress.entity';

@Injectable()
export class MattressesService {
  constructor(
    @InjectRepository(Mattress)
    private readonly mattressRepository: Repository<Mattress>,
  ) {}

  async create(data: Partial<Mattress>): Promise<Mattress> {
    const newMattress = this.mattressRepository.create(data);
    return await this.mattressRepository.save(newMattress);
  }

  async findAll(): Promise<Mattress[]> {
    return await this.mattressRepository.find();
  }

  async findOne(id: number): Promise<Mattress | null> {
    return await this.mattressRepository.findOne({ where: { id } });
  }

  async update(id: number, data: Partial<Mattress>): Promise<Mattress | null> {
    await this.mattressRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.mattressRepository.delete(id);
  }
}
