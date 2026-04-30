export const TripStatus = {
  PLANNED: 'planned',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FINALIZED: 'finalized',
  CONFIRMED: 'confirmed',
} as const;

export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus];
