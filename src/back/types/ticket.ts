export interface ITicket {
  number: number;
  raffle: {
    id: string;
    ticketPrice: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export enum ITicketStatus {
  Complete = 'Complete',
  Reserved = 'Reserved',
  PendingVerification = 'PendingVerification',
  Cancelled = 'Cancelled',
}
