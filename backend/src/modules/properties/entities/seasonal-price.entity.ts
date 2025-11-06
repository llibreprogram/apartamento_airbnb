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
import { Property } from './property.entity';

export enum PriceType {
  SEASONAL = 'seasonal',
  WEEKEND = 'weekend',
  HOLIDAY = 'holiday',
  CUSTOM = 'custom',
}

@Entity('seasonal_prices')
@Index(['propertyId', 'startDate', 'endDate'])
@Index(['propertyId', 'isActive'])
export class SeasonalPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  propertyId: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column({ type: 'varchar', length: 255 })
  name: string; // ej: "Verano 2025", "Navidad", "Fin de semana"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerNight: number; // Precio especial para este período

  @Column({ type: 'date' })
  startDate: string; // YYYY-MM-DD

  @Column({ type: 'date' })
  endDate: string; // YYYY-MM-DD

  @Column({ type: 'enum', enum: PriceType, default: PriceType.CUSTOM })
  type: PriceType;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
