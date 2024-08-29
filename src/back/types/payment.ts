export interface IPayment {
  id: string;
  raffle: {
    id: string;
  };
  currency: string | null;
  buyer: {
    id: string;
  } | null;
  customerDetails: {
    country: string;
    email: string;
    name: string;
  } | null;
  total: number | null;
  status: IPaymentStatus;
  url: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: number;
}

export interface IProcessPaymentPayload {
  raffle: {
    id: string;
  };
  payment: {
    id: string;
  };
}

export interface IPendingPaymentPayload {
  raffle: {
    id: string;
  };
  payment: {
    id: string;
  };
}

export interface IPaymentSuccess {
  id: string;
  buyer: {
    name: string;
    email: string;
  } | null;
  total: number | null;
  status: IPaymentStatus;
  updatedAt: string;
}

export enum IPaymentStatus {
  Paid = 'Paid',
  PendingPayment = 'PendingPayment',
  Created = 'Created',
}
