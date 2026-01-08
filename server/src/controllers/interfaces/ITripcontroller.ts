
// server/src/interfaces/ITripcontroller.ts
export interface ITripService {
  getAvailableTrips(filters: {
    destination?: string;
    transport?: string;
    interest?: string;
    page?: number;  
    limit?: number;  
  }): Promise<{ trips: any[], total: number }>; 

  createNewTrip(userId: string, data: any, filePath?: string): Promise<any>;
} 