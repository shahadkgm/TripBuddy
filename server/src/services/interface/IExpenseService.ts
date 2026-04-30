import { IExpenseDocument } from '../../types/expense.type';
import { CreateExpenseDTO } from '../../dto/expense.dto';

export interface IExpenseService {
  addExpense(data: CreateExpenseDTO): Promise<IExpenseDocument>;
  getTripExpenses(tripId: string): Promise<IExpenseDocument[]>;
  deleteExpense(expenseId: string): Promise<void>;
}
