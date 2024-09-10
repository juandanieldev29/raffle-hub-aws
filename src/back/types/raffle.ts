export interface ICreateRaffle {
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
  lastAvailableNumber: number;
  completionDate: string;
  createdAt: string;
  updatedAt: string;
}

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
  lastAvailableNumber: number;
  completionDate: string;
  boughtTickets: number[];
  createdAt: string;
  updatedAt: string;
}
