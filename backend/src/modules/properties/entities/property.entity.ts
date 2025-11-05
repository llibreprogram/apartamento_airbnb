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

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  STUDIO = 'studio',
}

@Entity('properties')
@Index(['ownerId'])
@Index(['city'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 20 })
  zipCode: string;

  @Column({ type: 'enum', enum: PropertyType })
  type: PropertyType;

  @Column({ type: 'int' })
  bedrooms: number;

  @Column({ type: 'int' })
  bathrooms: number;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerNight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  securityDeposit: number;

  @Column({ type: 'simple-array', nullable: true })
  amenities: string[];

  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
