import { IExpenseRepository } from '../../domain/repositories/interface/IExpenseRepository';
import { IExpenseService } from '../interface/IExpenseService';
import { IExpenseDocument } from '../../types/expense.type';
import { CreateExpenseDTO } from '../../dto/expense.dto';
import { logger } from '@/utils/logger';

export class ExpenseService implements IExpenseService {
    constructor(private _expenseRepository: IExpenseRepository) { }

    async addExpense(data: CreateExpenseDTO): Promise<IExpenseDocument> {
        logger.info(`Adding new expense for trip: ${data.tripId}, amount: ${data.amount}`);
        return await this._expenseRepository.create(data);
    }

    async getTripExpenses(tripId: string): Promise<IExpenseDocument[]> {
        logger.info(`Fetching expenses for trip: ${tripId}`);
        return await this._expenseRepository.findByTripId(tripId);
    }

    async deleteExpense(expenseId: string): Promise<void> {
        logger.info(`Deleting expense: ${expenseId}`);
        await this._expenseRepository.deleteById(expenseId);
    }
}
