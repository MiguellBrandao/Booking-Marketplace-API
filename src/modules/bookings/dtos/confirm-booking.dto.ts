import { IsInt } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmBookingDto {
    @ApiProperty({ example: 15 })
    @IsInt()
    id: number
}
