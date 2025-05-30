import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { HistoricalOrderItem } from './historical-order-item.entity';
import { Customer } from '../../customers/customer.entity';

@Entity('historical_orders')
export class HistoricalOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_number: string;

  @ManyToOne(() => Customer, { eager: true })
  customer: Customer;

  @Column({ type: 'varchar', nullable: true })
  ico?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  issue_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar' })
  production_status: 'pending' | 'in-production' | 'completed' | 'invoiced';

  @OneToMany(() => HistoricalOrderItem, (item) => item.order, { cascade: true })
  order_items: HistoricalOrderItem[];

  @Column()
  customer_name: string;
}
