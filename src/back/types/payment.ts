export interface IPayment {
  id: string;
  raffle: {
    id: string;
  };
  buyer: {
    name: string;
    email: string;
  } | null;
  total: number | null;
  status: IPaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentSuccessPayload {
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
