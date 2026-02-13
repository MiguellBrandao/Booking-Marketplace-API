import { Listings } from 'src/modules/listings/listings.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('AvailabilityBlocks')
export class AvailabilityBlocks {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Listings, (listing) => listing.id)
  listing: Listings;

  @Index()
  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Index()
  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column()
  reason: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
