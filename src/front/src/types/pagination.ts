import { IOwnedRaffle, IRaffle } from '@/types/raffle';

export interface RafflesPaginationResult {
  lastEvaluatedKey: { id: string } | null;
  raffles: IRaffle[];
}

export interface AdminRafflesPaginationResult {
  lastEvaluatedKey: { id: string } | null;
  raffles: IOwnedRaffle[];
}
