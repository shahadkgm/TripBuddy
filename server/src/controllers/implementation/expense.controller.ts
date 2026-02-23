import { Request, Response } from 'express';
import { IExpenseService } from '../../services/interface/IExpenseService';
import { StatusCode } from '../../constants/statusCode.enum';

export class ExpenseController {
    constructor(private _expenseService: IExpenseService) { }

    addExpense = async (req: Request, res: Response) => {
        try {
            const expense = await this._expenseService.addExpense(req.body);
            res.status(StatusCode.CREATED).json(expense);
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Error adding expense' });
        }
    };

    getTripExpenses = async (req: Request, res: Response) => {
        try {
            const { tripId } = req.params;
            const expenses = await this._expenseService.getTripExpenses(tripId);
            res.status(StatusCode.OK).json(expenses);
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching expenses' });
        }
    };

    deleteExpense = async (req: Request, res: Response) => {
        try {
            const { expenseId } = req.params;
            await this._expenseService.deleteExpense(expenseId);
            res.status(StatusCode.OK).json({ message: 'Expense deleted successfully' });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Error deleting expense' });
        }
    };
}
