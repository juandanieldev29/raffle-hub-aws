import { headers } from 'next/headers';

import RaffleDetail from '@/components/pages/raffle/show';

export default async function RaffleShowPage({ params }: { params: { raffleId: string } }) {
  const { raffleId } = params;
  const [raffleRes] = await Promise.all([
    fetch(`https://api.raffle-hub.net/raffle/${raffleId}`, {
      headers: headers(),
      cache: 'no-store',
    }),
  ]);
  const [raffle] = await Promise.all([raffleRes.json()]);

  return (
    <main className="mt-8 text-slate-700 dark:text-slate-200">
      <RaffleDetail raffle={raffle} availableNumbers={[]} />
    </main>
  );
}
