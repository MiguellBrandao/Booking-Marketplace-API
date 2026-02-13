import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Listings } from './listings.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ListingsService {
    constructor(@InjectRepository(Listings) private listingsRepository: Repository<Listings> ) {}

    async getListing(id: number) {
        const listing = await this.listingsRepository.findOne({ where: { id }, relations: { host: true } })
        if (!listing) throw new NotFoundException('Listing not found')

        return listing
    }

    async getListingsByHost(hostId: number) {
        const listings = await this.listingsRepository.find({ where: { host: { id: hostId } }  })
        return listings
    }

    async createListing(hostId: number, title: string, description: string, city: string, pricePerNight: number, currency: string, status: string) {
        const listing = this.listingsRepository.create({host: { id: hostId }, title, description, city, pricePerNight, currency, status})

        return await this.listingsRepository.save(listing)
    }

    async updateListing(id: number, dto) {
        const patch = Object.fromEntries(
            Object.entries(dto).filter(([, v]) => v !== undefined),
        );

        if (Object.keys(patch).length == 0)  throw new BadRequestException('At least one field must be provided');

        const listing = await this.listingsRepository.findOneBy({ id })
        if (!listing) throw new NotFoundException('Listing not found')

        Object.assign(listing, dto)

        return await this.listingsRepository.save(listing)
    }
}
