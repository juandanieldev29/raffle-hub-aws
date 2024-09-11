import RaffleBilling from '@/components/pages/raffle/billing';
import { IPayment, IVoucher } from '@/types';

export default async function RaffleBillingPage({ params }: { params: { raffleId: string } }) {
  const { raffleId } = params;

  const [paymentsRes, vouchersRes] = await Promise.all([
    fetch(`https://api.raffle-hub.net/raffle/${raffleId}/payments`, {
      cache: 'no-store',
    }),
    fetch(`https://api.raffle-hub.net/raffle/${raffleId}/vouchers`, {
      cache: 'no-store',
    }),
  ]);
  const [payments, vouchers]: [IPayment[], IVoucher[]] = await Promise.all([
    paymentsRes.json(),
    vouchersRes.json(),
  ]);

  return (
    <main className="margin-top margin-bottom">
      <RaffleBilling payments={payments} vouchers={vouchers} />
    </main>
  );
}
