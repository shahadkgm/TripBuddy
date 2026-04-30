import { Router } from 'express';
import { ReportController } from '../controllers/implementation/report.controller';
import { ReportService } from '../services/implementation/report.service';
import { ReportRepository } from '../repositories/implementation/report.repository';
import { protect, isAdmin } from '../middleware/authMiddleware';
import { API_ROUTES } from '../constants/routes.constants';

const router = Router();

const reportRepository = new ReportRepository();
const reportService = new ReportService(reportRepository);
const reportController = new ReportController(reportService);

// Protected: Any logged in user
router.post(API_ROUTES.REPORT.CREATE, protect, reportController.createReport);

// Admin Only
router.get(API_ROUTES.REPORT.GET_ALL, protect, isAdmin, reportController.getAllReports);
router.get(API_ROUTES.REPORT.GET_BY_TARGET, protect, isAdmin, reportController.getReportsByTarget);
router.patch(API_ROUTES.REPORT.UPDATE_STATUS, protect, isAdmin, reportController.updateStatus);

export default router;
