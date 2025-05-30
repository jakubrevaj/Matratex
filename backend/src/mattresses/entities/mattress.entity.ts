import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('mattresses')
export class Mattress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  base_price: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  coefficient: number | null;
}
