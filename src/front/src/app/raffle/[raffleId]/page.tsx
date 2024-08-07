import { headers } from 'next/headers';

import RaffleDetail from '@/components/pages/raffle/show';

export default async function RaffleShowPage({ params }: { params: { raffleId: string } }) {
  const { raffleId } = params;
  const [raffleRes, raffleAvailableNumbersRes] = await Promise.all([
    fetch(`https://api.raffle-hub.net/raffle/${raffleId}`, {
      headers: headers(),
      cache: 'no-store',
    }),
    fetch(`https://api.raffle-hub.net/raffle/${raffleId}/available-numbers`, {
      headers: headers(),
      cache: 'no-store',
    }),
  ]);
  const [raffle, raffleAvailableNumbers] = await Promise.all([
    raffleRes.json(),
    raffleAvailableNumbersRes.json(),
  ]);

  return (
    <main className="mt-8 text-slate-700 dark:text-slate-200">
      <RaffleDetail raffle={raffle} availableNumbers={raffleAvailableNumbers} />
    </main>
  );
}
