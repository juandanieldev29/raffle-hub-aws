export interface ITicket {
  id: string;
  number: number;
  raffle: {
    id: string;
    ticketPrice: number;
  };
  payment: {
    id: string;
  };
  status: ITicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IExpireTicketPayload {
  raffle: {
    id: string;
  };
  payment: {
    id: string;
  };
}

export interface ICompleteTicketPayload {
  raffle: {
    id: string;
  };
  payment: {
    id: string;
  };
}

export enum ITicketStatus {
  Complete = 'Complete',
  PendingPayment = 'PendingPayment',
  PendingVerification = 'PendingVerification',
  Expired = 'Expired',
}
