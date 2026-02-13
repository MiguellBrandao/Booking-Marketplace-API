import { Body, Controller, Get, Param, Patch, Post, Req, Request, UseGuards } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { ListingDto } from './dtos/listing.dto';

@Serialize(ListingDto)
@UseGuards(AuthGuard)
@Controller('listings')
export class ListingsController {
    constructor(private listingsService: ListingsService) {}

    @Get('/')
    getListings() {

    }

    @Get('/:id')
    getListing(@Param('id') id: number) {
        return this.listingsService.getListing(id)
    }

    @Get('/my')
    getMyListings(@Request() request) {
        return this.listingsService.getListingsByHost(request.user.id)
    }

    @Post('/')
    createListing(@Body() body: CreateListingDto , @Request() request) {
        return this.listingsService.createListing(request.user.id, body.title, body.description, body.city, body.pricePerNight, body.currency, body.status)
    }

    @Patch('/:id')
    updateListing(@Param('id') id: number, @Body() body: UpdateListingDto) {
        return this.listingsService.updateListing(id, body)
    }
}
