import { Bookings } from 'src/bookings/bookings.entity';
import { Listings } from 'src/listings/listings.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @OneToMany(() => Listings, (listing) => listing.hostId)
  listings: Listings[];

  @OneToMany(() => Bookings, (booking) => booking.guest)
  bookings: Bookings[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
