import { ExpenseModel } from '../../../models/expense.model';
import { IExpenseDocument } from '../../../types/expense.type';
import { BaseRepository } from './base.repository';
import { IExpenseRepository } from '../interface/IExpenseRepository';
import { CreateExpenseDTO } from '../../../dto/expense.dto';

export class ExpenseRepository extends BaseRepository<IExpenseDocument, CreateExpenseDTO> implements IExpenseRepository {
    constructor() {
        super(ExpenseModel);
    }

    async findByTripId(tripId: string): Promise<IExpenseDocument[]> {
        return await this._model.find({ tripId }).sort({ createdAt: -1 });
    }
}
