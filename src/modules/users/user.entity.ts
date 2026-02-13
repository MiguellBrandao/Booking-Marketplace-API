import { Bookings } from 'src/modules/bookings/bookings.entity';
import { Listings } from 'src/modules/listings/listings.entity';
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

  @Column({ type: 'text', nullable: true })
  hashedRefreshToken: string | null

  @OneToMany(() => Listings, (listing) => listing.host)
  listings: Listings[];

  @OneToMany(() => Bookings, (booking) => booking.guest)
  bookings: Bookings[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
