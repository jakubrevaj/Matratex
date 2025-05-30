import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('archived_items')
export class ArchivedItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  original_item_id: number;

  @Column()
  product_name: string;

  @Column()
  quantity: number;

  @Column('decimal', {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    transformer: { to: (v) => v, from: (v) => parseFloat(v) },
  })
  price: number;

  @Column('text', { nullable: true })
  notes_core: string;

  @Column('text', { nullable: true })
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

  @Column({ type: 'varchar', length: 50, nullable: true })
  order_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  customer_name: string; // názov podniku

  @Column({ type: 'varchar', length: 20, nullable: true })
  ico: string; // IČO

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  archived_at: Date;
}
