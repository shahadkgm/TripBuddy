// backend/src/controllers/trip.controller.ts
import { Request, Response } from 'express';
import { ITripService } from '../interfaces/ITripInterface.js'; // Ensure correct naming

export class TripController {
  constructor(private tripService: ITripService) {}

  /**
   * Fetches trips based on multiple optional filters.
   * If no filters are provided, it returns all active trips.
   */
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
      // 1. Extract body data
      const tripData = { ...req.body };

      // 2. Parse 'preferences' because it's sent as a JSON string from the frontend
      if (typeof tripData.preferences === 'string') {
        try {
          tripData.preferences = JSON.parse(tripData.preferences);
        } catch (e) {
          return res.status(400).json({ message: "Invalid preferences format" });
        }
      }

      // 3. Handle image path if you're using Multer middleware
      if (req.file) {
        // This saves the file path to the database
        tripData.tripImage = req.file.path; 
      }

      // 4. Pass the cleaned, structured object to the service
      const trip = await this.tripService.createNewTrip(tripData);
      
      res.status(201).json(trip);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating trip", error: error.message });
    }
  };
}