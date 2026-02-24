import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class TripPreferencesDTO {
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'Number of travelers must be a number' })
    @Type(() => Number)
    travelers!: number;

    @IsString()
    accommodation!: string;

    @IsString()
    transport!: string;

    @IsArray()
    @IsString({ each: true })
    interests!: string[];
}

export class CreateTripDTO {
    @IsString()
    @IsNotEmpty()
    userId!: string;

    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsNotEmpty()
    destination!: string;

    @IsDateString()
    startDate!: string;

    @IsDateString()
    endDate!: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '' || value === null || value === undefined) return undefined;
        return Number(value);
    })
    @IsNumber({}, { message: 'Estimated budget must be a number' })
    budget?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch (e) {
                console.log(e);
                return value;
            }
        }
        return value;
    })
    @ValidateNested()
    @Type(() => TripPreferencesDTO)
    preferences!: TripPreferencesDTO;
}
