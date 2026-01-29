import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  delivery_number: string;

  @CreateDateColumn()
  delivery_date: Date;

  @ManyToOne(() => Customer, { eager: true })
  customer: Customer;

  @ManyToMany(() => OrderItem)
  @JoinTable({
    name: 'delivery_items',
    joinColumn: { name: 'delivery_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'order_item_id', referencedColumnName: 'id' },
  })
  items: OrderItem[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  custom_items: {
    name: string;
    quantity: number;
    dimensions?: string;
    info?: string;
  }[];

  @Column({ default: false })
  is_printed: boolean;
}
