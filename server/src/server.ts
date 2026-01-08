import 'dotenv/config';

import path from 'path';
import express from 'express';
import cors from 'cors';

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from './routes/upload.routes.js';
import planRoutes from './routes/plan.routes.js';
import tripRoutes from './routes/trip.routes.js';
import guideRoutes from "./routes/guide.routes.js"
import adminRoutes from "./routes/admin.routes.js"


import { connectDB } from './config/db.js'; 
import UserRoutes from './routes/user.routes.js'; 

const app = express();
const PORT = process.env.PORT || 4000;
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use('/api', uploadRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/plantrips', planRoutes);
app.use('/api/users', UserRoutes);
app.use("/api/guides",guideRoutes)
app.use("/api/admin",adminRoutes)


// --- Base Route ---
app.get('/', (req, res) => {
    res.send('Node.js TypeScript Express Server is Running!');
});

// --- Start Server ---
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize server and database:', err);
    });
