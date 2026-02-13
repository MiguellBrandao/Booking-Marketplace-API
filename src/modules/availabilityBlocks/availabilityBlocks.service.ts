import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvailabilityBlocks } from './availabilityBlocks.entity';
import { Repository } from 'typeorm';
import { ListingsService } from '../listings/listings.service';

@Injectable()
export class AvailabilityBlockService {
    constructor(@InjectRepository(AvailabilityBlocks) private availabilityBlockService: Repository<AvailabilityBlocks>, private listingService: ListingsService) {}

    async createAvailabilityBlock(hostId: number, listingId: number, startDate: Date, endDate: Date, reason: string) {
        const listing = await this.listingService.getListing(listingId)
        if (!listing) throw new NotFoundException('Listing not found')
        if (listing.host.id != hostId) throw new UnauthorizedException('You are not the host of listing')

        const AvailabilityBlock = this.availabilityBlockService.create({
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

        const listing = await this.listingService.getListing(availabilityBlock.listing.id)
        if (listing.host.id != hostId) throw new UnauthorizedException('You are not the host of listing')

        return await this.availabilityBlockService.remove(availabilityBlock)
    }
}
