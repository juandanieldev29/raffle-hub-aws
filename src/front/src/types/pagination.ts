import { IRaffle } from '@/types/raffle';

export interface RafflesPaginationResult {
  metadata: {
    count: number;
  };
  raffles: IRaffle[];
}
