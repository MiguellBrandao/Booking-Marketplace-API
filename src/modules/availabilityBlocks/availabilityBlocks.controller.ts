import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AvailabilityBlockService } from './availabilityBlocks.service';
import { FindAvailabilityBlockDto } from './dtos/find-availabilityBlocks.dto';
import { CreateAvailabilityBlockDto } from './dtos/create-availabilityBlock.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { AvailabilityBlockDto } from './dtos/availabilityBlock.dto';

@Serialize(AvailabilityBlockDto)
@UseGuards(AuthGuard)
@Controller('availabilityblocks')
export class AvailabilityController {
    constructor(private availabilityBlockService: AvailabilityBlockService) {}

    @Get("/")
    findAvailabilityBlocks(@Query() query: FindAvailabilityBlockDto) {
        return this.availabilityBlockService.findAvailabilityBlocks(
            Number(query.listingId),
            query.startDate ? new Date(query.startDate) : undefined,
            query.endDate ? new Date(query.endDate) : undefined,
        )
    }

    @Post("/")
    createAvailabilityBlock(@Body() body: CreateAvailabilityBlockDto, @Request() request) {
        return this.availabilityBlockService.createAvailabilityBlock(request.user.id, body.listingId, body.startDate, body.endDate, body.reason)
    }

    @Delete("/:id")
    deleteAvailabilityBlock(@Param('id') id: number, @Request() request) {
        return this.availabilityBlockService.deleteAvailabilityBlock(request.user.id, id)
    }
}
