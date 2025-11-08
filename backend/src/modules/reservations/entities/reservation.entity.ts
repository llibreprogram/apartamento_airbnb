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
import { User } from '@/modules/auth/entities/user.entity';
import { Property } from '@/modules/properties/entities/property.entity';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('reservations')
@Index(['propertyId', 'guestId'])
@Index(['propertyId', 'checkIn', 'checkOut'])
@Index(['status'])
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column('uuid')
  guestId: string;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guestId' })
  guest: User;

  @Column('varchar', { length: 255 })
  guestName: string;

  @Column('varchar', { length: 255, nullable: true })
  guestEmail: string;

  @Column('varchar', { length: 20, nullable: true })
  guestPhone: string;

  @Column('date')
  checkIn: Date;

  @Column('date')
  checkOut: Date;

  @Column('integer')
  numberOfGuests: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  securityDeposit: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column('text', { nullable: true })
  notes: string;

  @Column('text', { nullable: true })
  cancellationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
