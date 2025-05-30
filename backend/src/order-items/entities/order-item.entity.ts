import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @Column({ length: 100 })
  product_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @Column({ type: 'int', default: 0 })
  count: number;

  @Column({ type: 'text', nullable: true })
  notes_core: string;

  @Column({ type: 'text', nullable: true })
  notes_cover: string;
  @Column({ type: 'text', nullable: true })
  label_1: string;
  @Column({ type: 'text', nullable: true })
  label_2: string;
  @Column({ type: 'text', nullable: true })
  label_3: string;

  @Column({ type: 'varchar', nullable: true })
  material_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  length: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  width: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tech_width: number;

  @ManyToOne(() => Invoice, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  invoice: Invoice;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status:
    | 'pending'
    | 'to-production'
    | 'in-production'
    | 'completed'
    | 'invoiced'
    | 'archived';

  @ManyToOne(() => Order, (order) => order.order_items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;
  static status: string;
  name: string;
  product: any;
}
