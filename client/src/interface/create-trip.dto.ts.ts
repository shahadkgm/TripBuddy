//frontend/src/modules/dtos/ create-trip.dto.ts


export interface CreateTripDTO {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
}

export const validateTripDTO = (data: any) => {
  const errors: Record<string, string> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!data.title || data.title.length < 3) errors.title = "Title must be at least 3 characters.";
  if (!data.destination) errors.destination = "Destination is required.";
  
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (!data.startDate || start < today) errors.startDate = "Start date cannot be in the past.";
  if (!data.endDate || end < start) errors.endDate = "End date must be after start date.";
  if (!data.budget || Number(data.budget) <= 0) errors.budget = "Please enter a valid budget.";

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};