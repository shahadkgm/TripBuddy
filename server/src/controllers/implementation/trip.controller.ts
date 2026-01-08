// backend/src/controllers/trip.controller.ts
import { Request, Response } from 'express';
import { ITripService } from '../interfaces/ITripcontroller.js';

export class TripController {
  constructor(private tripService: ITripService) {}

  
  getAllTrips = async (req: Request, res: Response) => {
    try {
      console.log("its from backend trip get all ")
      // 1. Extract all query parameters
      const { destination, transport, interest } = req.query;
      
      // 2. Pass the entire filter object to the service
      const trips = await this.tripService.getAvailableTrips({
        destination: destination as string,
        transport: transport as string,
        interest: interest as string
      });
      
      res.status(200).json(trips);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching trips", error: error.message });
    }
  };

  /**
   * Handles the creation of a trip.
   * Processes Multipart/Form-Data, parses JSON preferences, and handles images.
   */
  createTrip = async (req: Request, res: Response) => {
  try {
    const tripData = { ...req.body };

    if (typeof tripData.preferences === "string") {
      tripData.preferences = JSON.parse(tripData.preferences);
    }

    const userId = (req as any).user.id; 
    const filePath = req.file?.path;

    const trip = await this.tripService.createNewTrip(
      userId,
      tripData,
      filePath
    );

    res.status(201).json(trip);
  } catch (error: any) {
    res.status(400).json({ message: "Error creating trip", error: error.message });
  }
};

}