import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from "class-validator";
import { ListingStatus } from "../listings.entity";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateListingDto {
    @ApiProperty({ example: 'Cozy Apartment Downtown' })
    @IsString()
    title: string

    @ApiPropertyOptional({ example: '2-bedroom apartment close to metro.' })
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty({ example: 'Lisbon' })
    @IsString()
    city: string;

    @ApiProperty({ example: 120 })
    @IsNumber()
    pricePerNight: number;

    @ApiProperty({ example: 'EUR' })
    @IsString()
    currency: string;

    @ApiProperty({ enum: ListingStatus, example: ListingStatus.ACTIVE })
    @IsEnum(ListingStatus)
    status: string;
}
