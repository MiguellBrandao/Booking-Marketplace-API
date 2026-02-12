import { Listings } from 'src/listings/listings.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Availability')
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Listings, (listing) => listing.id)
  listingId: number;

  @Index()
  @Column()
  startDate: Date;

  @Index()
  @Column()
  endDate: Date;

  @Column()
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
