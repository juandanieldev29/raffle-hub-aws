'use client';

import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import Link from 'next/link';

import { IOwnedRaffle, IPaymentStatus, IVoucherStatus } from '@/types';
import { differenceInDays, formatNumber } from '@/utils';

import 'chart.js/auto';

interface RaffleAdminCardProps {
  raffle: IOwnedRaffle;
}

export default function RaffleAdminCard({ raffle }: RaffleAdminCardProps) {
  const [missingDays, setMissingDays] = useState<number>(0);
  const [totalMoney, setTotalMoney] = useState<string | null>(null);

  useEffect(() => {
    if (raffle) {
      const days = differenceInDays(new Date(), new Date(raffle.completionDate));
      setMissingDays(days);
      setTotalMoney(formatNumber(raffle.boughtTickets.length * raffle.ticketPrice));
    }
  }, [raffle]);

  return (
    <div
      className={
        'width secondary-background-color padding margin-bottom rounded-2xl grid lg:grid-cols-3 md:grid-rows-6 md:gap-x-8 gap-2 shadow-lg'
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
      <p className="md:col-start-2 text-3xl font-bold">{totalMoney}</p>
      <p className="md:col-start-2 text-2xl font-semibold">Porcentaje de números vendidos</p>
      <p className="md:col-start-2 text-3xl font-bold">
        {(raffle.boughtTickets.length / raffle.quantityNumbers) * 100}%
      </p>
      <p className="md:col-start-3 md:row-start-1 text-2xl font-bold">
        Pagos con tarjeta completados
      </p>
      <p className="md:col-start-3 md:row-start-2 text-3xl font-bold">
        {raffle.payments.filter((x) => x.status === IPaymentStatus.Complete).length}
      </p>
      <p className="md:col-start-3 md:row-start-3 text-2xl font-bold">
        Pagos con SINPE movil completados
      </p>
      <p className="md:col-start-3 md:row-start-4 text-3xl font-bold">
        {raffle.vouchers.filter((x) => x.status === IVoucherStatus.Complete).length}
      </p>
      <p className="md:col-start-3 md:row-start-5 text-2xl font-bold">
        Pagos con SINPE movil pendientes de verificación
      </p>
      <p className="md:col-start-3 md:row-start-6 text-3xl font-bold">
        {raffle.vouchers.filter((x) => x.status === IVoucherStatus.PendingVerification).length}
      </p>
      <Link href={`/raffle/${raffle.id}/billing`} className="md:col-start-3 md:row-start-8">
        <button className="button-padding transition-transform rounded-md transition-colors primary-button-colors">
          Ver detalles de facturas
        </button>
      </Link>
    </div>
  );
}
