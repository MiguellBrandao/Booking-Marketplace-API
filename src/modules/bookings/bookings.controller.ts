import { Body, Controller, HttpCode, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { ConfirmBookingDto } from './dtos/confirm-booking.dto';
import { CancelBookingDto } from './dtos/cancel-booking.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post('/')
  createBooking(@Body() body: CreateBookingDto, @Request() request) {
    return this.bookingsService.createBooking(
      body.lisitngId,
      request.user.id,
      body.startDate,
      body.endDate,
      body.currency,
    );
  }

  @Patch('confirm')
  confirmBooking(@Body() body: ConfirmBookingDto) {
    return this.bookingsService.confirmBooking(body.id);
  }

  @Patch('cancel')
  cancelBooking(@Body() body: CancelBookingDto, @Request() request) {
    return this.bookingsService.cancelBooking(body.id, request.user.id, body.reason);
  }
}
