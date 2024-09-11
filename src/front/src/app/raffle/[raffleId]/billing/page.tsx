import { cookies } from 'next/headers';
import Error from 'next/error';
import { fetchAuthSession } from 'aws-amplify/auth/server';

import RaffleBilling from '@/components/pages/raffle/billing';
import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';
import { IPayment, IVoucher } from '@/types';

export default async function RaffleBillingPage({ params }: { params: { raffleId: string } }) {
  const { raffleId } = params;

  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchAuthSession(contextSpec),
  });
  const [paymentsRes, vouchersRes] = await Promise.all([
    fetch(`https://api.raffle-hub.net/raffle/${raffleId}/payments`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.tokens?.idToken}`,
      },
    }),
    fetch(`https://api.raffle-hub.net/raffle/${raffleId}/vouchers`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.tokens?.idToken}`,
      },
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
