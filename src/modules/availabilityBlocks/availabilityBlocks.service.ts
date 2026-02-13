import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvailabilityBlocks } from './availabilityBlocks.entity';
import { Repository } from 'typeorm';
import { ListingsService } from '../listings/listings.service';

@Injectable()
export class AvailabilityBlockService {
  constructor(
    @InjectRepository(AvailabilityBlocks)
    private availabilityBlockService: Repository<AvailabilityBlocks>,
    private listingService: ListingsService,
  ) {}

  private async queryAvailabilityBlocks(
    listingId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { listing: { id: listingId } };
    if (startDate != null) where.startDate = startDate;
    if (endDate != null) where.endDate = endDate;

    return this.availabilityBlockService.find({
      where,
      relations: { listing: true },
    });
  }

  private async ensureNoOverlap(
    listingId: number,
    startDate: Date,
    endDate: Date,
    excludeId?: number,
  ) {
    const query = this.availabilityBlockService
      .createQueryBuilder('ab')
      .where('ab.listingId = :listingId', { listingId })
      .andWhere('ab.startDate < :endDate', { endDate })
      .andWhere('ab.endDate > :startDate', { startDate });

    if (excludeId !== undefined) {
      query.andWhere('ab.id != :excludeId', { excludeId });
    }

    const overlap = await query.getOne();
    if (overlap) {
      throw new ConflictException(
        'Availability block overlaps an existing block for this listing',
      );
    }
  }

  async createAvailabilityBlock(
    hostId: number,
    listingId: number,
    startDate: Date | string,
    endDate: Date | string,
    reason: string,
  ) {
    const normalizedStartDate = new Date(startDate);
    const normalizedEndDate = new Date(endDate);
    if (
      Number.isNaN(normalizedStartDate.getTime()) ||
      Number.isNaN(normalizedEndDate.getTime())
    ) {
      throw new BadRequestException('Invalid dates');
    }
    if (normalizedStartDate >= normalizedEndDate) {
      throw new BadRequestException('startDate must be before endDate');
    }

    const listing = await this.listingService.getListing(listingId);
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.host.id != hostId)
      throw new UnauthorizedException('You are not the host of listing');
    await this.ensureNoOverlap(
      listingId,
      normalizedStartDate,
      normalizedEndDate,
    );

    const AvailabilityBlock = this.availabilityBlockService.create({
      listing: { id: listingId },
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      reason,
    });

    return this.availabilityBlockService.save(AvailabilityBlock);
  }

  async findAvailabilityBlocks(
    listingId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const availabilityBlocks = await this.queryAvailabilityBlocks(
      listingId,
      startDate,
      endDate,
    );
    if (availabilityBlocks.length === 0)
      throw new NotFoundException('Availability Blocks not found');

    return availabilityBlocks;
  }

  async findAvailabilityBlocksForBooking(
    listingId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    return this.queryAvailabilityBlocks(listingId, startDate, endDate);
  }

  async deleteAvailabilityBlock(hostId: number, id: number) {
    const availabilityBlock = await this.availabilityBlockService.findOne({
      where: { id },
      relations: { listing: true },
    });
    if (!availabilityBlock)
      throw new NotFoundException('Availability Block not found');

    const listing = await this.listingService.getListing(
      availabilityBlock.listing.id,
    );
    if (listing.host.id != hostId)
      throw new UnauthorizedException('You are not the host of listing');

    return await this.availabilityBlockService.remove(availabilityBlock);
  }

  async updateAvailabilityBlock(
    hostId: number,
    id: number,
    startDate?: string,
    endDate?: string,
    reason?: string,
  ) {
    const availabilityBlock = await this.availabilityBlockService.findOne({
      where: { id },
      relations: { listing: true },
    });
    if (!availabilityBlock) {
      throw new NotFoundException('Availability Block not found');
    }

    const listing = await this.listingService.getListing(
      availabilityBlock.listing.id,
    );
    if (listing.host.id != hostId) {
      throw new UnauthorizedException('You are not the host of listing');
    }

    const normalizedStartDate = startDate
      ? new Date(startDate)
      : availabilityBlock.startDate;
    const normalizedEndDate = endDate
      ? new Date(endDate)
      : availabilityBlock.endDate;
    if (
      Number.isNaN(normalizedStartDate.getTime()) ||
      Number.isNaN(normalizedEndDate.getTime())
    ) {
      throw new BadRequestException('Invalid dates');
    }
    if (normalizedStartDate >= normalizedEndDate) {
      throw new BadRequestException('startDate must be before endDate');
    }

    await this.ensureNoOverlap(
      availabilityBlock.listing.id,
      normalizedStartDate,
      normalizedEndDate,
      id,
    );

    availabilityBlock.startDate = normalizedStartDate;
    availabilityBlock.endDate = normalizedEndDate;
    if (reason !== undefined) {
      availabilityBlock.reason = reason;
    }

    return this.availabilityBlockService.save(availabilityBlock);
  }
}
