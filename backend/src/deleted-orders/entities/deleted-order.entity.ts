import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { DeletedOrderItem } from './deleted-order-item.entity';

@Entity('deleted_orders')
@Index(['order_number'])
@Index(['issue_date'])
@Index(['deleted_at'])
export class DeletedOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  order_number: string;

  @Column({ type: 'varchar', nullable: true })
  customer_name: string;

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  deleted_at: Date;

  @Column({ type: 'varchar', nullable: true })
  deleted_by: string;

  @OneToMany(() => DeletedOrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  order_items: DeletedOrderItem[];
}








