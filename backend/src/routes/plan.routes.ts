import express from 'express';
import { createTrip } from '../controllers/plancontroller.js';
// import { TripController } from '../controllers/trip.controller.js';

import multer from 'multer';

const upload = multer({ dest: 'uploads/' }); 

const router = express.Router();
// router.get('/', TripController.get);

router.post('/', upload.single('tripImage'), createTrip);

export default router;