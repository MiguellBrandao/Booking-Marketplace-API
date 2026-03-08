import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AvailabilityBlockService } from './availabilityBlocks.service';
import { FindAvailabilityBlockDto } from './dtos/find-availabilityBlocks.dto';
import { CreateAvailabilityBlockDto } from './dtos/create-availabilityBlock.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { AvailabilityBlockDto } from './dtos/availabilityBlock.dto';
import { UpdateAvailabilityBlockDto } from './dtos/update-availabilityBlock.dto';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

@Serialize(AvailabilityBlockDto)
@UseGuards(AuthGuard)
@ApiTags('AvailabilityBlocks')
@ApiBearerAuth()
@Controller('availabilityblocks')
export class AvailabilityController {
    constructor(private availabilityBlockService: AvailabilityBlockService) {}

    @Get("/")
    @ApiOperation({ summary: 'Find availability blocks for a listing and date range' })
    @ApiOkResponse({ type: AvailabilityBlockDto, isArray: true })
    findAvailabilityBlocks(@Query() query: FindAvailabilityBlockDto) {
        return this.availabilityBlockService.findAvailabilityBlocks(
            Number(query.listingId),
            query.startDate ? new Date(query.startDate) : undefined,
            query.endDate ? new Date(query.endDate) : undefined,
        )
    }

    @Post("/")
    @ApiOperation({ summary: 'Create a new availability block' })
    @ApiBody({ type: CreateAvailabilityBlockDto })
    @ApiOkResponse({ type: AvailabilityBlockDto })
    createAvailabilityBlock(@Body() body: CreateAvailabilityBlockDto, @Request() request) {
        return this.availabilityBlockService.createAvailabilityBlock(request.user.id, body.listingId, body.startDate, body.endDate, body.reason)
    }

    @Delete("/:id")
    @ApiOperation({ summary: 'Delete an availability block by id' })
    @ApiParam({ name: 'id', example: 7 })
    @ApiOkResponse({
        schema: { example: { ok: true } },
    })
    deleteAvailabilityBlock(@Param('id') id: number, @Request() request) {
        return this.availabilityBlockService.deleteAvailabilityBlock(request.user.id, id)
    }

    @Patch("/:id")
    @ApiOperation({ summary: 'Edit an existing availability block by id' })
    @ApiParam({ name: 'id', example: 7 })
    @ApiBody({ type: UpdateAvailabilityBlockDto })
    @ApiOkResponse({ type: AvailabilityBlockDto })
    updateAvailabilityBlock(
      @Param('id') id: number,
      @Body() body: UpdateAvailabilityBlockDto,
      @Request() request,
    ) {
      return this.availabilityBlockService.updateAvailabilityBlock(
        request.user.id,
        id,
        body.startDate,
        body.endDate,
        body.reason,
      );
    }
}
