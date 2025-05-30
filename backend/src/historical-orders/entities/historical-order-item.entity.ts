import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { HistoricalOrder } from './historical-order.entity';

@Entity('historical_order_items')
export class HistoricalOrderItem {
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

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  length: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  width: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tech_width: number;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  status: string;

  @Column({ type: 'int', nullable: true }) // ← dočasne nullable
  order_id: number;

  @ManyToOne(() => HistoricalOrder, (order) => order.order_items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: HistoricalOrder;
}
