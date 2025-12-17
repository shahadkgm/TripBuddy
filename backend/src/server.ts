
import * as dotenv from 'dotenv';
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
dotenv.config(); 

import express from 'express';
import cors from 'cors';
// IMPT: Using .js extension for the config and routes files
import { connectDB } from './config/db.js'; 
import UserRoutes from './routes/user.routes.js'; 

const app = express();
const PORT = process.env.PORT || 4000;

// --- 1. Middleware ---
app.use(cors());
app.use(express.json()); 
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);



// --- 2. Base Route ---
app.get('/', (req, res) => {
    res.send('Node.js TypeScript Express Server is Running!');
});

// --- 3. API Routes ---
app.use('/api/users', UserRoutes); 

// --- 4. Start Server ---
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize server and database:', err);
    });