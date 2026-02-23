import { IExpenseRepository } from '../../repositories/interface/IExpenseRepository';
import { IExpenseService } from '../interface/IExpenseService';
import { IExpenseDocument } from '../../types/expense.type';
import { CreateExpenseDTO } from '../../dto/expense.dto';

export class ExpenseService implements IExpenseService {
    constructor(private _expenseRepository: IExpenseRepository) { }

    async addExpense(data: CreateExpenseDTO): Promise<IExpenseDocument> {
        return await this._expenseRepository.create(data);
    }

    async getTripExpenses(tripId: string): Promise<IExpenseDocument[]> {
        return await this._expenseRepository.findByTripId(tripId);
    }

    async deleteExpense(expenseId: string): Promise<void> {
        await this._expenseRepository.deleteById(expenseId);
    }
}
