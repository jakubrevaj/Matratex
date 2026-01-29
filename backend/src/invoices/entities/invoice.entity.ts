import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('invoices')
@Index(['invoice_number'])
@Index(['customer_name'])
@Index(['due_date'])
@Index(['status'])
@Index(['created_at'])
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

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  discount: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  discount_percent: number;

  // discount duplicated definition removed

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

  @Column({
    type: 'varchar',
    length: 20,
    default: 'unpaid',
  })
  status: 'paid' | 'unpaid' | 'overdue' | 'partially_paid';

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  paid_at: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  paid_amount: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  last_payment_check: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  last_reminder_sent: Date;

  @CreateDateColumn()
  created_at: Date;

  // Položky ako JSON snapshot
  @Column({ type: 'jsonb', default: [] })
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
