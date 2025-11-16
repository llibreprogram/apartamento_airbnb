import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Property } from '@/modules/properties/entities/property.entity';

export enum ExpenseCategory {
  MAINTENANCE = 'maintenance',
  CLEANING = 'cleaning',
  UTILITIES = 'utilities',
  ELECTRICITY = 'electricity',
  INTERNET = 'internet',
  CONDO_FEES = 'condo_fees',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  REPAIRS = 'repairs',
  SUPPLIES = 'supplies',
  PAYPAL_COMMISSION = 'paypal_commission',
  OTHER = 'other',
}

@Entity('expenses')
@Index(['propertyId', 'category'])
@Index(['propertyId', 'date'])
@Index(['date'])
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
  })
  category: ExpenseCategory;

  @Column('varchar', { length: 255 })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('date')
  date: Date;

  @Column('text', { nullable: true })
  receiptUrl: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('boolean', { default: false })
  isPaid: boolean;

  // Campos específicos para gastos de electricidad
  @Column('varchar', { length: 7, nullable: true })
  electricityPeriod: string; // Formato: YYYY-MM

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  electricityTotalCharged: number; // Total cobrado a huéspedes ese mes

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  electricityDifference: number; // Diferencia (cobrado - pagado)

  @Column('integer', { nullable: true })
  electricityReservationsCount: number; // Cantidad de reservas con electricidad ese mes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
