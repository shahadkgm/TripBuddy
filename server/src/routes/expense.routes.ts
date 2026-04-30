import { Router } from 'express';
import { ExpenseRepository } from '../repositories/implementation/expense.repository';
import { ExpenseService } from '../services/implementation/expense.service';
import { ExpenseController } from '../controllers/implementation/expense.controller';
import { protect } from '../middleware/authMiddleware';
import { API_ROUTES } from '../constants/routes.constants';
import { dtoValidationMiddleware } from '../middleware/dtoValidation';
import { CreateExpenseDTO } from '../dto/expense.dto';

const router = Router();

// DI
const expenseRepository = new ExpenseRepository();
const expenseService = new ExpenseService(expenseRepository);
const expenseController = new ExpenseController(expenseService);

router.use(protect);

router.post(
  API_ROUTES.EXPENSE.ADD,
  dtoValidationMiddleware(CreateExpenseDTO),
  expenseController.addExpense
);

router.get(API_ROUTES.EXPENSE.GET_BY_TRIP, expenseController.getTripExpenses);

router.delete(API_ROUTES.EXPENSE.DELETE, expenseController.deleteExpense);

export default router;
