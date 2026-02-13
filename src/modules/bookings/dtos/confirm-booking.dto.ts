import { IsInt } from "class-validator";

export class ConfirmBookingDto {
    @IsInt()
    id: number
}
