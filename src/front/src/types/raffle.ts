export interface IRaffle {
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
  boughtTickets: number;
  lastAvailableNumber: number;
  createdAt: string;
  updatedAt: string;
}
