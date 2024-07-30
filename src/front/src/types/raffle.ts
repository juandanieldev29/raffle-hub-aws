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
  quantitySeries?: number;
  ticketPrice: number;
  complete: {
    type: Boolean;
    default: false;
  };
  boughtTickets: number;
  lastAvailableNumber: number;
  tickets: Array<{
    id: string;
    buyer: { id: string; email: string; name: string; photoURL?: string };
    number: number;
    serie?: number;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
