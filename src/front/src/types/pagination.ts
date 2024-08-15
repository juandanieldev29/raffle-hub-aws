import { IRaffle } from '@/types/raffle';

export interface RafflesPaginationResult {
  lastEvaluatedKey: { id: string } | null;
  raffles: IRaffle[];
}
