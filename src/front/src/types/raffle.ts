import { IPayment } from './payment';
import { ITicket } from './ticket';
import { IVoucher } from './voucher';

export interface IRaffle {
  ownerId: string;
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
  quantitySeries: number | null;
  ticketPrice: number;
  boughtTickets: number[];
  lastAvailableNumber: number;
  completionDate: string;
  allowCardPayment: boolean;
  allowVoucherPayment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOwnedRaffle {
  ownerId: string;
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
  quantitySeries: number | null;
  ticketPrice: number;
  lastAvailableNumber: number;
  completionDate: string;
  boughtTickets: number[];
  tickets: ITicket[];
  payments: IPayment[];
  vouchers: IVoucher[];
  createdAt: string;
  updatedAt: string;
}
