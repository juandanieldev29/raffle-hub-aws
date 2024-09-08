export interface IVoucher {
  raffleId: string;
  id: string;
  raffle: {
    id: string;
  };
  url: string;
  buyer: {
    id: string;
  } | null;
  status: IVoucherStatus;
  createdAt: string;
  updatedAt: string;
}

export enum IVoucherStatus {
  Complete = 'Complete',
  PendingPayment = 'PendingPayment',
  Created = 'Created',
}
