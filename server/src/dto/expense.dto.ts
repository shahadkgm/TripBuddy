import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateExpenseDTO {
  @IsString()
  @IsNotEmpty()
  tripId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  paidBy!: string;

  @IsOptional()
  @IsString()
  splitAmong: 'All' | string[] = 'All';
}
