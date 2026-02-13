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

  @Column()
  startDate: Date;

  @Column()
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
  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  canceledAt: Date;

  @Column({ nullable: true })
  cancelReason: string;

  @Column({ nullable: true })
  expiredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
