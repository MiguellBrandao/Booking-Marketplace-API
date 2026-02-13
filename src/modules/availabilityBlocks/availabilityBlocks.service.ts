import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvailabilityBlocks } from './availabilityBlocks.entity';
import { Repository } from 'typeorm';
import { ListingsService } from '../listings/listings.service';

@Injectable()
export class AvailabilityBlockService {
    constructor(@InjectRepository(AvailabilityBlocks) private availabilityBlockService: Repository<AvailabilityBlocks>, private listingService: ListingsService) {}

    async createAvailabilityBlock(hostId: number, listingId: number, startDate: Date, endDate: Date, reason: string) {
        const listing = this.listingService.getListing(listingId, hostId)
        if (!listing) throw new NotFoundException('Listing not found')

        const AvailabilityBlock = await this.availabilityBlockService.create({
            listing: { id: listingId },
            startDate,
            endDate,
            reason
        })
        return this.availabilityBlockService.save(AvailabilityBlock)
    }

    async findAvailabilityBlocks(listingId: number, startDate?: Date, endDate?: Date) {
        const where: any = { listing: { id: listingId } }
        if (startDate != null) where.startDate = startDate
        if (endDate != null) where.endDate = endDate

        const availabilityBlocks = await this.availabilityBlockService.find({
            where,
            relations: { listing: true },
        })
        if (availabilityBlocks.length === 0) throw new NotFoundException('Availability Blocks not found')

        return availabilityBlocks
    }

    async deleteAvailabilityBlock(hostId: number, id: number) {
        const availabilityBlock = await this.availabilityBlockService.findOne({ where: { id }, relations: { listing: true } })
        if (!availabilityBlock) throw new NotFoundException('Availability Block not found')

        await this.listingService.getListing(availabilityBlock.listing.id, hostId)

        return await this.availabilityBlockService.remove(availabilityBlock)
    }
}
