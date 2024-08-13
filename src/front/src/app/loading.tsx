import SkeletonRaffleCard from '@/components/raffle/skeleton-raffle-card';

export default function Loading() {
  return (
    <div className="w-11/12 mx-auto">
      <SkeletonRaffleCard />
      <SkeletonRaffleCard />
      <SkeletonRaffleCard />
      <SkeletonRaffleCard />
    </div>
  );
}
