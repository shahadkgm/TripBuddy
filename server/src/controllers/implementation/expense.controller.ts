import { Request, Response } from 'express';
import { IExpenseService } from '../../services/interface/IExpenseService';
import { asyncHandler } from '../../utils/asyncHandler';
import { BaseController } from './base.controller';

export class ExpenseController extends BaseController {
    constructor(private _expenseService: IExpenseService) {
        super();
    }

    addExpense = asyncHandler(async (req: Request, res: Response) => {
        const expense = await this._expenseService.addExpense(req.body);
        this.sendCreated(res, expense, 'Expense added successfully');
    });

    getTripExpenses = asyncHandler(async (req: Request, res: Response) => {
        const { tripId } = req.params;
        const expenses = await this._expenseService.getTripExpenses(tripId);
        this.sendSuccess(res, expenses, 'Expenses fetched successfully');
    });

    deleteExpense = asyncHandler(async (req: Request, res: Response) => {
        const { expenseId } = req.params;
        await this._expenseService.deleteExpense(expenseId);
        this.sendSuccess(res, null, 'Expense deleted successfully');
    });
}

