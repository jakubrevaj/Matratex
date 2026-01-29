import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { DeletedOrder } from './deleted-order.entity';

@Entity('deleted_order_items')
@Index(['product_name'])
@Index(['status'])
export class DeletedOrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  product_name: string;

  @Column({ type: 'varchar', nullable: true })
  material_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', nullable: true })
  count: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  length: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  width: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tech_width: number;

  @Column({ type: 'text', nullable: true })
  notes_core: string;

  @Column({ type: 'text', nullable: true })
  notes_cover: string;

  @Column({ type: 'varchar', nullable: true })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  label_1: string;

  @Column({ type: 'varchar', nullable: true })
  label_2: string;

  @Column({ type: 'varchar', nullable: true })
  label_3: string;

  @ManyToOne(() => DeletedOrder, (order) => order.order_items, {
    onDelete: 'CASCADE',
  })
  order: DeletedOrder;
}








