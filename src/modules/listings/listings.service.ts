import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Listings } from './listings.entity';
import { Repository } from 'typeorm';
import { GetListingsDto } from './dtos/get-listings.dto';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listings)
    private listingsRepository: Repository<Listings>,
  ) {}

  async getListings(query: GetListingsDto) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
    const minPrice =
      query.minPrice != null ? Number(query.minPrice) : undefined;
    const maxPrice =
      query.maxPrice != null ? Number(query.maxPrice) : undefined;

    const qb = this.listingsRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.host', 'host')
      .orderBy('listing.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.city) {
      qb.andWhere('listing.city ILIKE :city', { city: `%${query.city}%` });
    }
    if (minPrice != null) {
      qb.andWhere('listing.pricePerNight >= :minPrice', { minPrice });
    }
    if (maxPrice != null) {
      qb.andWhere('listing.pricePerNight <= :maxPrice', { maxPrice });
    }

    const [data, total] = await qb.getManyAndCount();
    Logger.log(data);
    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getListing(id: number) {
    const listing = await this.listingsRepository.findOne({
      where: { id },
      relations: { host: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    return listing;
  }

  async getListingsByHost(hostId: number) {
    const listings = await this.listingsRepository.find({
      where: { host: { id: hostId } },
    });
    return listings;
  }

  async createListing(
    hostId: number,
    title: string,
    description: string,
    city: string,
    pricePerNight: number,
    currency: string,
    status: string,
  ) {
    const listing = this.listingsRepository.create({
      host: { id: hostId },
      title,
      description,
      city,
      pricePerNight,
      currency,
      status,
    });

    return await this.listingsRepository.save(listing);
  }

  async updateListing(id: number, dto) {
    const patch = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );

    if (Object.keys(patch).length == 0)
      throw new BadRequestException('At least one field must be provided');

    const listing = await this.listingsRepository.findOneBy({ id });
    if (!listing) throw new NotFoundException('Listing not found');

    Object.assign(listing, dto);

    return await this.listingsRepository.save(listing);
  }
}
