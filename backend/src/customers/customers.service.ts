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

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.find();
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
