import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  ico: string | null;

  @Column({ type: 'varchar', length: 14, nullable: true })
  drc: string | null;

  @Column({ type: 'varchar', length: 35, nullable: true })
  podnik: string | null;

  @Column({ type: 'varchar', length: 35, nullable: true })
  podnik2: string | null;

  @Column({ type: 'varchar', length: 35, nullable: true })
  adresa: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  psc: string | null;

  @Column({ type: 'varchar', length: 25, nullable: true })
  mesto: string | null;

  @Column({ type: 'varchar', length: 25, nullable: true })
  stat: string | null;

  @Column({ type: 'varchar', length: 25, nullable: true })
  tel: string | null;

  @Column({ type: 'varchar', length: 14, nullable: true })
  mobil: string | null;

  @Column({ type: 'varchar', length: 14, nullable: true })
  mobil2: string | null;

  @Column({ type: 'varchar', length: 1, nullable: true })
  plat_dph: string | null;

  @Column({ type: 'float', nullable: true })
  zlava: number | null;

  @Column({ type: 'varchar', length: 14, nullable: true })
  cuct: string | null;

  @Column({ type: 'varchar', length: 18, nullable: true })
  banka: string | null;

  @Column({ type: 'varchar', length: 4, nullable: true })
  kod_ban: string | null;

  @Column({ type: 'float', nullable: true })
  kod: number | null;

  @Column({ type: 'varchar', length: 25, nullable: true })
  kpodnik: string | null;

  @Column({ type: 'varchar', length: 25, nullable: true })
  kadresa: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  kpsc: string | null;

  @Column({ type: 'varchar', length: 18, nullable: true })
  kmesto: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  zhz: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  lok: string | null;

  @Column({ type: 'varchar', length: 1, nullable: true })
  fy: string | null;

  @Column({ type: 'varchar', length: 1, nullable: true })
  sk: string | null;
  orders: any;

  @Column({ type: 'varchar', length: 50, nullable: true })
  email: string | null;
}
