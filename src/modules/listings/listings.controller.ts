import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';
import { GetListingsDto } from './dtos/get-listings.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { ListingDto } from './dtos/listing.dto';
import { ListingsPageDto } from './dtos/listings-page.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

@UseGuards(AuthGuard)
@ApiTags('Listings')
@ApiBearerAuth()
@Controller('listings')
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

  @Get('/')
  @ApiOperation({
    summary: 'List listings with optional filters and pagination',
  })
  @ApiOkResponse({ type: ListingsPageDto })
  async getListings(@Query() query: GetListingsDto) {
    const page = await this.listingsService.getListings(query);
    return {
      ...page,
      data: plainToInstance(ListingDto, page.data, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Get('/my')
  @Serialize(ListingDto)
  @ApiOperation({ summary: 'Get listings of authenticated host' })
  @ApiOkResponse({ type: ListingDto, isArray: true })
  getMyListings(@Request() request) {
    return this.listingsService.getListingsByHost(request.user.id);
  }

  @Get('/:id')
  @Serialize(ListingDto)
  @ApiOperation({ summary: 'Get a listing by id' })
  @ApiParam({ name: 'id', example: 10 })
  @ApiOkResponse({ type: ListingDto })
  getListing(@Param('id') id: number) {
    return this.listingsService.getListing(id);
  }

  @Post('/')
  @Serialize(ListingDto)
  @ApiOperation({ summary: 'Create a listing' })
  @ApiBody({ type: CreateListingDto })
  @ApiOkResponse({ type: ListingDto })
  createListing(@Body() body: CreateListingDto, @Request() request) {
    return this.listingsService.createListing(
      request.user.id,
      body.title,
      body.description,
      body.city,
      body.pricePerNight,
      body.currency,
      body.status,
    );
  }

  @Patch('/:id')
  @Serialize(ListingDto)
  @ApiOperation({ summary: 'Update a listing by id' })
  @ApiParam({ name: 'id', example: 10 })
  @ApiBody({ type: UpdateListingDto })
  @ApiOkResponse({ type: ListingDto })
  updateListing(@Param('id') id: number, @Body() body: UpdateListingDto) {
    return this.listingsService.updateListing(id, body);
  }
}
