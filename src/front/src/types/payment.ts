export interface IPayment {
  id: string;
  amount_subtotal: number;
  amount_total: number;
  created: number;
  currency: 'crc';
  expires_at: number;
  livemode: boolean;
  mode: 'payment' | 'setup' | 'subscription';
  payment_method_types: Array<string>;
  payment_status: 'no_payment_required' | 'unpaid' | 'paid';
  status: IPaymentStatus;
  success_url: string;
  url: string;
}

export enum IPaymentStatus {
  Complete = 'Complete',
  PendingPayment = 'PendingPayment',
  Created = 'Created',
  Expired = 'Expired',
}
