import { Listings } from 'src/modules/listings/listings.entity';
import { Users } from 'src/modules/users/user.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('Bookings')
@Index('IDX_bookings_listing_status_period', [
  'listing',
  'status',
  'startDate',
  'endDate',
])
@Check(`"startDate" < "endDate"`)
@Check(`("status"::text != 'pending') OR ("expiresAt" IS NOT NULL)`)
export class Bookings {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Listings, (listing) => listing.bookings)
  listing: Listings;

  @Index()
  @ManyToOne(() => Users, (user) => user.bookings)
  guest: Users;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Index()
  @Column({
    type: 'enum',
    enum: BookingStatus,
    enumName: 'bookings_status_enum',
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column()
  totalAmount: number;

  @Column()
  currency: string;

  @Index()
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  canceledAt: Date;

  @Column({ nullable: true })
  cancelReason: string;

  @Column({ type: 'timestamptz', nullable: true })
  expiredAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
