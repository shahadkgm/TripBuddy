import { Request, Response } from 'express';
import Trip from '../models/trip.model.js';

export const createTrip = async (req: Request, res: Response) => {
  try {
    const { title, destination, startDate, endDate, description, budget, userId } = req.body;

    const newTrip = new Trip({
      title,
      destination,
      startDate,
      endDate,
      description,
      budget,
      userId,
      tripImage: req.file ? req.file.path : null, // If using Multer for image upload
      tripMember: [userId] // The creator is the first member
    });

    await newTrip.save();
    res.status(201).json({ message: 'Trip created successfully', trip: newTrip });
  } catch (error) {
    console.error("Trip creation error:", error);
    res.status(500).json({ message: 'Server error while creating trip' });
  }
};