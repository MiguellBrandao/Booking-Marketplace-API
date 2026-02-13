import { IsNumber } from "class-validator";

export class CreateListing {
    @IsNumber()
    id
}
