import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  Index,
} from 'typeorm';
import { Customer } from '../../customers/customer.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';

@Entity('orders')
@Index(['order_number'])
@Index(['issue_date'])
@Index(['production_status'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  order_number: string;

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

  // Relácie k faktúram (ak budú potrebné)
  invoices?: Invoice[];

  // Statická vlastnosť pre TypeORM
  static customer: Customer;
}
