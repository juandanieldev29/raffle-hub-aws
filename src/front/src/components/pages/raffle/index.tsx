'use client';
import { useEffect, useState, useRef, useContext } from 'react';
import RaffleCard from '@/components/raffle/raffle-card';
import Pagination from '@/components/pagination';
import { IRaffle } from '@/types/raffle';
import { RafflesPaginationResult } from '@/types/pagination';

import { INITIAL_PAGE, INITIAL_PAGE_SIZE } from '@/utils/constants';
import { UserContext } from '@/contexts/user-context';

interface RaffleListProps {
  rafflesPaginated: RafflesPaginationResult;
}

export default function RaffleIndex({ rafflesPaginated }: RaffleListProps) {
  const [_, setCurrentUser] = useContext(UserContext);

  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(INITIAL_PAGE);
  const [rafflesMetadata, setRafflesMetadata] = useState<
    RafflesPaginationResult['metadata'] | null
  >(rafflesPaginated.metadata);
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
    // setRafflesMetadata(data.metadata);
    // setLocalRaffles(data.raffles);
  };

  const fetchCurrentUser = async () => {
    const response = await fetch('/api/auth/currentuser', {
      cache: 'no-store',
    });
    const { currentUser: user } = await response.json();
    setCurrentUser(user);
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
