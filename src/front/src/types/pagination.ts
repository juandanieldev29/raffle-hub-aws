import { IOwnedRaffle, IRaffle } from '@/types';

export interface RafflesPaginationResult {
  lastEvaluatedKey: { ownerId: string; id: string } | null;
  raffles: IRaffle[];
}

export interface AdminRafflesPaginationResult {
  lastEvaluatedKey: { ownerId: string; id: string } | null;
  raffles: IOwnedRaffle[];
}
