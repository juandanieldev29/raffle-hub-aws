'use client';
import { useEffect, useState, useRef } from 'react';
import RaffleCard from '@/components/raffle/raffle-card';
import Pagination from '@/components/pagination';
import { IRaffle } from '@/types/raffle';
import { RafflesPaginationResult } from '@/types/pagination';

import { INITIAL_PAGE, INITIAL_PAGE_SIZE } from '@/utils/constants';

interface RaffleListProps {
  rafflesPaginated: RafflesPaginationResult;
}

export default function RaffleIndex({ rafflesPaginated }: RaffleListProps) {
  const [pageSize] = useState(INITIAL_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(INITIAL_PAGE);
  const [rafflesMetadata] = useState<RafflesPaginationResult['metadata'] | null>(
    rafflesPaginated.metadata,
  );
  const [localRaffles, setLocalRaffles] = useState<Array<IRaffle>>(rafflesPaginated.raffles);
  const pageInitiallyRendered = useRef(false);

  const fetchRaffles = async () => {
    const res = await fetch(
      `https://api.raffle-hub.net/raffle?page=${currentPage}&pageSize=${pageSize}`,
      {
        cache: 'no-store',
      },
    );
    const data = await res.json();
    setLocalRaffles(data);
  };

  useEffect(() => {
    if (pageInitiallyRendered.current) {
      fetchRaffles();
      return;
    }
    pageInitiallyRendered.current = true;
  }, [currentPage, pageSize]);

  return (
    <>
      {localRaffles.map((raffle) => {
        return (
          <RaffleCard
            key={raffle.id}
            raffle={raffle}
            includeLinkToDetails
            disableAnimations={false}
          />
        );
      })}
      {rafflesMetadata && (
        <Pagination
          totalResuls={rafflesMetadata?.count}
          pageSize={pageSize}
          setPage={setCurrentPage}
          activePage={currentPage}
        />
      )}
    </>
  );
}
