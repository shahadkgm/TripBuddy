import { IExpenseDocument } from '../../types/expense.type';
import { IBaseRepository } from './IBaseRepository';
import { CreateExpenseDTO } from '../../dto/expense.dto';

export interface IExpenseRepository extends IBaseRepository<IExpenseDocument, CreateExpenseDTO> {
  findByTripId(tripId: string): Promise<IExpenseDocument[]>;
}
