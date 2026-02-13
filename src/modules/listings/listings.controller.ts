import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';
import { GetListingsDto } from './dtos/get-listings.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { ListingDto } from './dtos/listing.dto';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

@Serialize(ListingDto)
@UseGuards(AuthGuard)
@ApiTags('Listings')
@ApiBearerAuth()
@Controller('listings')
export class ListingsController {
    constructor(private listingsService: ListingsService) {}

    @Get('/')
    @ApiOperation({ summary: 'List listings with optional filters and pagination' })
    @ApiOkResponse({
      schema: {
        example: {
          data: [],
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      },
    })
    getListings(@Query() query: GetListingsDto) {
        return this.listingsService.getListings(query);
    }

    @Get('/my')
    @ApiOperation({ summary: 'Get listings of authenticated host' })
    @ApiOkResponse({ type: ListingDto, isArray: true })
    getMyListings(@Request() request) {
        return this.listingsService.getListingsByHost(request.user.id)
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get a listing by id' })
    @ApiParam({ name: 'id', example: 10 })
    @ApiOkResponse({ type: ListingDto })
    getListing(@Param('id') id: number) {
        return this.listingsService.getListing(id)
    }

    @Post('/')
    @ApiOperation({ summary: 'Create a listing' })
    @ApiBody({ type: CreateListingDto })
    @ApiOkResponse({ type: ListingDto })
    createListing(@Body() body: CreateListingDto , @Request() request) {
        return this.listingsService.createListing(request.user.id, body.title, body.description, body.city, body.pricePerNight, body.currency, body.status)
    }

    @Patch('/:id')
    @ApiOperation({ summary: 'Update a listing by id' })
    @ApiParam({ name: 'id', example: 10 })
    @ApiBody({ type: UpdateListingDto })
    @ApiOkResponse({ type: ListingDto })
    updateListing(@Param('id') id: number, @Body() body: UpdateListingDto) {
        return this.listingsService.updateListing(id, body)
    }
}
