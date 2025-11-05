import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from '@/modules/properties/entities/property.entity';

@Entity('financials')
export class Financial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column({ type: 'varchar', length: 7 })
  period: string; // Format: YYYY-MM (e.g., 2025-10)

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  grossIncome: number; // Total income from all reservations

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalExpenses: number; // Total expenses from all records

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  commissionAmount: number; // Admin commission (10% of gross income)

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  netProfit: number; // Gross Income - Total Expenses - Commission

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  roi: number; // Return on Investment percentage

  @Column({ type: 'integer', default: 0 })
  numberOfReservations: number; // Total confirmed reservations in period

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  averageReservationValue: number; // Gross Income / Number of Reservations

  @Column({ type: 'varchar', nullable: true })
  notes: string; // Additional notes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Composite index for queries
  static readonly INDEX_PROPERTY_PERIOD = 'idx_financial_property_period';
}
