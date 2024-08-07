export interface ITicket {
  buyer: {
    id: string;
    email: string;
    name: string;
    photoURL?: string;
  };
  number: number;
  serie?: number;
  raffle: {
    id: string;
    quantityNumbers: number;
    quantitySeries?: number;
    ticketPrice: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
