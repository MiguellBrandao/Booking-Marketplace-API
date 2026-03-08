import { AvailabilityBlocks } from 'src/modules/availabilityBlocks/availabilityBlocks.entity';
import { Bookings } from 'src/modules/bookings/bookings.entity';
import { Users } from 'src/modules/users/user.entity';
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
  host: Users;

  @Column()
  title: string;

  @Column({ nullable: true})
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

  @OneToMany(() => AvailabilityBlocks, (availability) => availability.listing)
  availability: AvailabilityBlocks[];

  @OneToMany(() => Bookings, (booking) => booking.listing)
  bookings: Bookings[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
