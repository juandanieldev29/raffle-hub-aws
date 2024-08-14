'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { IRaffle } from '@/types/raffle';
import { formatNumber, formatDate } from '@/utils';

interface RaffleCardProps {
  raffle: IRaffle;
  includeLinkToDetails?: boolean;
  disableAnimations?: boolean;
}

export default function RaffleCard({
  raffle,
  includeLinkToDetails = false,
  disableAnimations = true,
}: RaffleCardProps) {
  const [ticketPrice, setTicketPrice] = useState<string | null>(null);
  const [prize, setPrize] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    setTicketPrice(formatNumber(raffle.ticketPrice));
    setPrize(formatNumber(raffle.prize));
    setCreatedAt(formatDate(raffle.createdAt));
  }, [raffle]);

  return (
    <div
      className={classNames(
        'w-11/12 mx-auto secondary-background-color p-4 mb-4 rounded-2xl transition-transform grid md:grid-cols-3 grid-rows-6 md:gap-x-8 gap-2 shadow-lg',
        {
          'md:hover:scale-[1.01]': !disableAnimations,
        },
      )}
    >
      <h2
        title={raffle.description}
        className="title text-2xl md:text-3xl line-clamp-3 text-wrap md:col-span-2 row-span-3 font-semibold"
      >
        {raffle.description}
      </h2>
      <p className="md:col-start-3 font-semibold">Precio del número</p>
      <p className="text-sm font-extralight md:col-start-3 font-medium" suppressHydrationWarning>
        {ticketPrice}
      </p>
      <p className="md:col-start-3 font-semibold">Premio</p>
      <p className="text-sm font-extralight md:col-start-3 font-medium" suppressHydrationWarning>
        {prize}
      </p>
      <p className="md:col-start-3 font-semibold">Números disponibles</p>
      <p className="text-sm font-extralight md:col-start-3 font-medium">
        {raffle.quantityNumbers - raffle.boughtTickets}
      </p>
      <p className="md:col-start-3 font-semibold">Fecha de creación</p>
      <p className="text-sm font-extralight md:col-start-3 font-medium" suppressHydrationWarning>
        {createdAt}
      </p>
      <p className="md:col-start-3 font-semibold">Creado por</p>
      <p className="text-sm font-extralight md:col-start-3 font-medium">{raffle.owner.name}</p>
      {includeLinkToDetails && (
        <Link
          href={`/raffle/${raffle.id}`}
          className="md:col-start-1 md:row-start-9 md:row-span-2 md:self-end"
        >
          <button className="p-2 transition-transform rounded transition-colors primary-button-colors">
            Ver detalles
          </button>
        </Link>
      )}
    </div>
  );
}
