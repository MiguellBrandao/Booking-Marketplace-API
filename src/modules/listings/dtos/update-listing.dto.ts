import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ListingStatus } from "../listings.entity";
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateListingDto {
    @ApiPropertyOptional({ example: 'Cozy Apartment Downtown - Renovated' })
    @IsOptional()
    @IsString()
    title: string

    @ApiPropertyOptional({ example: 'Now with a dedicated workspace.' })
    @IsOptional()
    @IsString()
    description: string;

    @ApiPropertyOptional({ example: 'Porto' })
    @IsOptional()
    @IsString()
    city: string;

    @ApiPropertyOptional({ example: 150 })
    @IsOptional()
    @IsNumber()
    pricePerNight: number;

    @ApiPropertyOptional({ example: 'EUR' })
    @IsOptional()
    @IsString()
    currency: string;

    @ApiPropertyOptional({ enum: ListingStatus, example: ListingStatus.ACTIVE })
    @IsOptional()
    @IsEnum(ListingStatus)
    status: string;
}
