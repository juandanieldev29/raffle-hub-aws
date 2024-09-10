export interface ITicket {
  raffleId: string;
  id: string;
  number: number;
  raffle: {
    id: string;
    ticketPrice: number;
  };
  payment: {
    id: string;
  } | null;
  voucher: {
    id: string;
  } | null;
  status: ITicketStatus;
  createdAt: string;
  updatedAt: string;
}

export enum ITicketStatus {
  Complete = 'Complete',
  PendingPayment = 'PendingPayment',
  PendingVerification = 'PendingVerification',
  Expired = 'Expired',
}
