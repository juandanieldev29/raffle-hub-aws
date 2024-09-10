export interface IRaffle {
  ownerId: string;
  id: string;
  owner: {
    id: string;
    email: string;
    name: string;
    photoURL?: string;
  };
  prize: number;
  description: string;
  quantityNumbers: number;
  quantitySeries: number | null;
  ticketPrice: number;
  boughtTickets: number[];
  lastAvailableNumber: number;
  completionDate: string;
  createdAt: string;
  updatedAt: string;
}
