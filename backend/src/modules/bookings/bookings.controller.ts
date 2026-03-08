import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { ConfirmBookingDto } from './dtos/confirm-booking.dto';
import { CancelBookingDto } from './dtos/cancel-booking.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BookingDto } from './dtos/booking.dto';

@UseGuards(AuthGuard)
@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create a booking in PENDING status' })
  @ApiBody({ type: CreateBookingDto })
  @Serialize(BookingDto)
  @ApiOkResponse({ type: BookingDto })
  createBooking(@Body() body: CreateBookingDto, @Request() request) {
    return this.bookingsService.createBooking(
      body.listingId,
      request.user.id,
      body.startDate,
      body.endDate,
      body.currency,
    );
  }

  @Patch('confirm')
  @ApiOperation({ summary: 'Confirm a pending booking' })
  @ApiBody({ type: ConfirmBookingDto })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  confirmBooking(@Body() body: ConfirmBookingDto) {
    return this.bookingsService.confirmBooking(body.id);
  }

  @Patch('cancel')
  @ApiOperation({ summary: 'Cancel a booking as the guest owner' })
  @ApiBody({ type: CancelBookingDto })
  @Serialize(BookingDto)
  @ApiOkResponse({ type: BookingDto })
  cancelBooking(@Body() body: CancelBookingDto, @Request() request) {
    return this.bookingsService.cancelBooking(
      body.id,
      request.user.id,
      body.reason,
    );
  }
}
