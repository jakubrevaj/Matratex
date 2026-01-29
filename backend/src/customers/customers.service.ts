import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async findAll(page = 1, limit = 100, search?: string): Promise<Customer[]> {
    const skip = (page - 1) * limit;
    
    if (search && search.length >= 2) {
      return this.customersRepository
        .createQueryBuilder('customer')
        .where('LOWER(customer.podnik) LIKE LOWER(:search)', {
          search: `%${search}%`,
        })
        .orderBy('customer.podnik', 'ASC')
        .take(limit)
        .skip(skip)
        .getMany();
    }
    
    return this.customersRepository.find({
      take: limit,
      skip: skip,
      order: { podnik: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Customer | null> {
    return this.customersRepository.findOneBy({ id }) ?? null;
  }

  async create(customer: Customer): Promise<Customer> {
    return this.customersRepository.save(customer);
  }

  async update(
    id: number,
    customerData: Partial<Customer>,
  ): Promise<Customer | null> {
    await this.customersRepository.update(id, customerData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.customersRepository.delete(id);
  }
}
