export interface ITrip {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        avatarURL?: string;
        avatar?: string; // Standardize this
        role: string;
    };
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    description?: string;
    preferences: {
        travelers: number;
        accommodation: string;
        transport: string;
        interests: string[];
    };
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface ITripFilters {
    destination?: string;
    transport?: string;
    interest?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedTrips {
    trips: ITrip[];
    total: number;
}
