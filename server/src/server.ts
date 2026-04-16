import 'reflect-metadata';
import 'dotenv/config';

import path from 'path';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';
import guideRoutes from './routes/guide.routes';
import adminRoutes from './routes/admin.routes';
import tripRoutes from './routes/trip.routes';
import connectionRoutes from './routes/connection.routes';
import expenseRoutes from './routes/expense.routes';
import galleryRoutes from './routes/gallery.routes';
import reviewRoutes from './routes/review.routes';


import aiRoutes from './routes/ai.routes';
import paymentRoutes from './routes/payment.routes';
import { connectDB } from './config/db';
import UserRoutes from './routes/user.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { API_ROUTES } from './constants/routes.constants';


import { createServer } from 'http';
import { setupSocket } from './config/socket';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
setupSocket(httpServer);

const PORT = process.env.PORT || 4000;

// --- Middlewares ---
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- Base Route ---
app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Node.js TypeScript Express Server is Running!' });
});

// --- Routes ---
app.use('/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/plantrips', tripRoutes);
app.use('/api/connections', connectionRoutes);
app.use(API_ROUTES.EXPENSE.BASE, expenseRoutes);
app.use(API_ROUTES.GALLERY.BASE, galleryRoutes);
app.use(API_ROUTES.AI.BASE, aiRoutes);
app.use(API_ROUTES.PAYMENT.BASE, paymentRoutes);
app.use(API_ROUTES.REVIEW.BASE, reviewRoutes);



import { startCronJobs } from './jobs/trip.cron';

app.use(errorMiddleware);

// --- Start Server ---
connectDB()
    .then(() => {
        //where cron jobs are initialized 
        startCronJobs();

        httpServer.listen(PORT, () => {
            console.log(`Server listening on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize server and database:', err);
    });
