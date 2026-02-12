import { Availability } from 'src/availability/availability.entity';
import { Bookings } from 'src/bookings/bookings.entity';
import { Users } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ListingStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('Listings')
export class Listings {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Users, (user) => user.id)
  hostId: Users;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  city: string;

  @Column()
  pricePerNight: number;

  @Column()
  currency: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.ACTIVE,
  })
  status: string;

  @OneToMany(() => Availability, (availability) => availability.listingId)
  availability: Availability[];

  @OneToMany(() => Bookings, (booking) => booking.listing)
  bookings: Bookings[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
