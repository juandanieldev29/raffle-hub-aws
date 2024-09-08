export interface IPayment {
  raffleId: string;
  id: string;
  raffle: {
    id: string;
  };
  currency: string | null;
  buyer: {
    id: string;
  } | null;
  customerDetails: {
    country: string | null;
    email: string | null;
    name: string | null;
  } | null;
  total: number | null;
  status: IPaymentStatus;
  url: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: number;
}

export interface IPendingPaymentPayload {
  raffle: {
    id: string;
  };
  payment: {
    id: string;
  };
}

export interface IPaymentSuccessPayload {
  raffle: {
    id: string;
  };
  payment: {
    id: string;
  };
  customerDetails: {
    country: string | null;
    email: string | null;
    name: string | null;
  } | null;
  total: number | null;
}

export enum IPaymentStatus {
  Complete = 'Complete',
  PendingPayment = 'PendingPayment',
  Created = 'Created',
}
