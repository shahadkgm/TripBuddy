import { Request, Response } from 'express';
import { IExpenseService } from '../../services/interface/IExpenseService';
import { StatusCode } from '../../constants/statusCode.enum';
import { asyncHandler } from '../../utils/asyncHandler';

export class ExpenseController {
    constructor(private _expenseService: IExpenseService) { }

    addExpense = asyncHandler(async (req: Request, res: Response) => {
        const expense = await this._expenseService.addExpense(req.body);
        res.status(StatusCode.CREATED).json(expense);
    });

    getTripExpenses = asyncHandler(async (req: Request, res: Response) => {
        const { tripId } = req.params;
        const expenses = await this._expenseService.getTripExpenses(tripId);
        res.status(StatusCode.OK).json(expenses);
    });

    deleteExpense = asyncHandler(async (req: Request, res: Response) => {
        const { expenseId } = req.params;
        await this._expenseService.deleteExpense(expenseId);
        res.status(StatusCode.OK).json({ message: 'Expense deleted successfully' });
    });
}
