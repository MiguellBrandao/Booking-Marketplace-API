import { BadRequestException, ConflictException, ForbiddenException, GoneException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookings, BookingStatus } from './bookings.entity';
import { DataSource, Repository } from 'typeorm';
import { ListingsService } from '../listings/listings.service';
import { UsersService } from '../users/users.service';
import { AvailabilityBlockService } from '../availabilityBlocks/availabilityBlocks.service';
import { Listings } from '../listings/listings.entity';
@Injectable()
export class BookingsService {
    constructor(@InjectRepository(Bookings) private bookingsRepository:Repository<Bookings>, private listingsService: ListingsService, private usersService: UsersService, private availabilityBlocksService: AvailabilityBlockService, private dataSource: DataSource) {}

    async createBooking(listingId: number, guestId: number, startDate: Date, endDate: Date, currency: string) {
        const listing = await this.listingsService.getListing(listingId)
        if (!listing) throw new NotFoundException('Listing not found')

        const guest = await this.usersService.findUser(guestId)
        if (!guest) throw new UnauthorizedException()

        const blocks = await this.availabilityBlocksService.findAvailabilityBlocks(listing.id, startDate, endDate)
        if (blocks.length > 0) throw new ConflictException('Listing is not available for the selected dates')

        const millisecondsPerNight = 24 * 60 * 60 * 1000
        const nights = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / millisecondsPerNight)
        if (nights <= 0) throw new BadRequestException('Invalid booking dates')
        const totalAmount = nights * listing.pricePerNight

        const booking = this.bookingsRepository.create({
            listing: { id: listingId },
            guest: { id: guestId },
            startDate,
            endDate,
            status: BookingStatus.PENDING,
            totalAmount,
            currency,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        })

        return await this.bookingsRepository.save(booking)
    }

    async confirmBooking(id: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const bookingRepo = queryRunner.manager.getRepository(Bookings);
            const listingsRepo = queryRunner.manager.getRepository(Listings);

            const booking = await bookingRepo
            .createQueryBuilder('b')
            .leftJoinAndSelect('b.listing', 'listing')
            .where('b.id = :id', { id })
            .setLock('pessimistic_write')
            .getOne();

            if (!booking) throw new NotFoundException('Booking not found');
            if (booking.status !== BookingStatus.PENDING) throw new ConflictException('Invalid status');
            if (booking.expiresAt < new Date()) throw new GoneException('Booking expired');

            await listingsRepo
            .createQueryBuilder('l')
            .where('l.id = :listingId', { listingId: booking.listing.id })
            .setLock('pessimistic_write')
            .getOne();

            const conflictCount = await bookingRepo
            .createQueryBuilder('b')
            .innerJoin('b.listing', 'l')
            .where('l.id = :listingId', { listingId: booking.listing.id })
            .andWhere('b.status = :status', { status: BookingStatus.CONFIRMED })
            .andWhere('b.id != :bookingId', { bookingId: booking.id })
            .andWhere('b.startDate < :endDate', { endDate: booking.endDate })
            .andWhere('b.endDate > :startDate', { startDate: booking.startDate })
            .getCount();

            if (conflictCount > 0) {
                throw new ConflictException('Overlapping confirmed booking exists');
            }

            booking.status = BookingStatus.CONFIRMED;
            await bookingRepo.save(booking);

            await queryRunner.commitTransaction();
            return { ok: true };
        } catch (e) {
            await queryRunner.rollbackTransaction();
            throw e;
        } finally {
            await queryRunner.release();
        }
    }

    async cancelBooking(id: number, guestId: number, reason: string) {
        const booking = await this.bookingsRepository.findOne({ where: { id }, relations: { guest: true } })
        if (!booking) throw new NotFoundException('Booking not found')
        if (booking.guest.id != guestId) throw new ForbiddenException("You can't edit someone else's booking.")
        if (booking.status === BookingStatus.CANCELLED) {
            throw new ConflictException('Booking already cancelled');
        }

        booking.status = BookingStatus.CANCELLED;
        booking.canceledAt = new Date();
        booking.cancelReason = reason ?? null;

        return this.bookingsRepository.save(booking)
    }
}
