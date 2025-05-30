import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Customer } from '../../customers/customer.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  order_number: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => Customer, (customer) => customer.orders, { eager: true })
  customer: Customer;

  @Column({ type: 'varchar', nullable: true })
  ico?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  issue_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  production_status: 'pending' | 'in-production' | 'completed' | 'invoiced';

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  order_items: OrderItem[];
  invoices: any;
  static customer: any;
}
