'use client';

import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';

import { IRaffle } from '@/types/raffle';
import { differenceInDays } from '@/utils';

import 'chart.js/auto';

interface RaffleAdminCardProps {
  raffle: IRaffle;
}

export default function RaffleAdminCard({ raffle }: RaffleAdminCardProps) {
  const [missingDays, setMissingDays] = useState<number>(0);

  useEffect(() => {
    if (raffle) {
      const days = differenceInDays(new Date(), new Date(raffle.completionDate));
      setMissingDays(days);
    }
  }, [raffle]);

  return (
    <div
      className={
        'width secondary-background-color padding margin-bottom rounded-2xl grid lg:grid-cols-3 md:grid-rows-6  md:gap-x-8 gap-2 shadow-lg'
      }
    >
      <Doughnut
        className="lg:max-w-96 lg:max-h-96 max-w-80 max-h-80 row-span-full"
        options={{ responsive: true }}
        data={{
          labels: ['Vendido', 'Restantes'],
          datasets: [
            {
              label: 'Cantidad',
              data: [
                raffle.boughtTickets.length,
                raffle.quantityNumbers - raffle.boughtTickets.length,
              ],
              backgroundColor: ['rgb(29, 78, 216)', 'rgb(147, 197, 253)'],
            },
          ],
        }}
      />
      <p className="md:col-start-2 text-2xl font-semibold">Dias restantes</p>
      <p className="md:col-start-2 text-3xl font-bold">
        {missingDays < 0 ? 'Expirado' : missingDays}
      </p>
      <p className="md:col-start-2 text-2xl font-semibold">Números vendidos</p>
      <p className="md:col-start-2 text-3xl font-bold">{raffle.boughtTickets.length}</p>
      <p className="md:col-start-2 text-2xl font-semibold">Dinero recaudado</p>
      <p className="md:col-start-2 text-3xl font-bold">
        {raffle.boughtTickets.length * raffle.ticketPrice}
      </p>
      <p className="md:col-start-2 text-2xl font-semibold">Porcentaje de números vendidos</p>
      <p className="md:col-start-2 text-3xl font-bold">
        {(raffle.boughtTickets.length / raffle.quantityNumbers) * 100}%
      </p>
    </div>
  );
}
