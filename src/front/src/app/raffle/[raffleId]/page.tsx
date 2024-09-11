import RaffleDetail from '@/components/pages/raffle/show';
import { IRaffle } from '@/types';

export default async function RaffleShowPage({
  params,
  searchParams,
}: {
  params: { raffleId: string };
  searchParams: { ownerId: string };
}) {
  const { raffleId } = params;
  const { ownerId } = searchParams;
  const [raffleRes, raffleAvailableNumbersRes] = await Promise.all([
    fetch(`https://api.raffle-hub.net/raffle/${raffleId}?ownerId=${ownerId}`, {
      cache: 'no-store',
    }),
    fetch(`https://api.raffle-hub.net/raffle/${raffleId}/available-numbers?ownerId=${ownerId}`, {
      cache: 'no-store',
    }),
  ]);
  const [raffle, raffleAvailableNumbers]: [IRaffle, Array<number>] = await Promise.all([
    raffleRes.json(),
    raffleAvailableNumbersRes.json(),
  ]);

  return (
    <main className="margin-top margin-bottom">
      <RaffleDetail raffle={raffle} availableNumbers={raffleAvailableNumbers} />
    </main>
  );
}
