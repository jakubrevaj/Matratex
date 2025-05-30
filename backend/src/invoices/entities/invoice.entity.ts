import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  invoice_number: string;

  // Uchová si orderId ako referenciu, ale nie ako vzťah
  @Column({ nullable: true })
  orderId: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  issue_date: Date;

  @Column({ type: 'date', nullable: true })
  due_date: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total_price: number;

  @Column({ nullable: true })
  variable_symbol: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  customer_name: string;

  @Column()
  customer_address: string;

  @Column({ nullable: true })
  customer_ico?: string;

  @Column({ nullable: true })
  order_number: string;

  @Column({ nullable: true })
  issued_by: string;

  @CreateDateColumn()
  created_at: Date;

  // Položky ako JSON snapshot
  @Column({ type: 'jsonb' })
  items: {
    name: string;
    material: string;
    dimensions: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes_core?: string;
    notes_cover?: string;
  }[];
}
