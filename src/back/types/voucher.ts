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

export interface IPendingVoucherPayload {
  raffle: {
    id: string;
  };
  voucher: {
    id: string;
  };
}

export enum IVoucherStatus {
  Complete = 'Complete',
  PendingVerification = 'PendingVerification',
  Created = 'Created',
  Rejected = 'Rejected',
}
