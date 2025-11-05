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
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  REPAIRS = 'repairs',
  SUPPLIES = 'supplies',
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
