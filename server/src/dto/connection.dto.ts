import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateConnectionDTO {
    @IsOptional()
    @IsString()
    senderId?: string;

    @IsString()
    @IsNotEmpty()
    receiverId!: string;

    @IsOptional()
    @IsString()
    tripId?: string;

    @IsOptional()
    @IsEnum(['pending', 'accepted', 'rejected'])
    status?: 'pending' | 'accepted' | 'rejected';
}
