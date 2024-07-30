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
  return (
    <div
      className={classNames(
        'w-11/12 mx-auto bg-slate-50 dark:bg-slate-900 p-4 mb-4 rounded-2xl transition-transform grid md:grid-cols-3 md:grid-rows-6 md:gap-x-8 gap-2 shadow-lg',
        {
          'md:hover:scale-[1.01]': !disableAnimations,
        },
      )}
    >
      <h2
        title={raffle.description}
        className="title text-3xl line-clamp-3 text-wrap md:col-span-2 md:row-span-3 font-semibold"
      >
        {raffle.description}
      </h2>
      <p className="md:col-start-3 font-semibold">Precio del número</p>
      <p className="text-sm font-extralight md:col-start-3 font-medium" suppressHydrationWarning>
        {formatNumber(raffle.ticketPrice)}
      </p>
      <p className="md:col-start-3 font-semibold">Premio</p>
      <p className="text-sm font-extralight md:col-start-3 font-medium" suppressHydrationWarning>
        {formatNumber(raffle.prize)}
      </p>
      <p className="md:col-start-3 font-semibold">Números disponibles</p>
      <p className="text-sm font-extralight md:col-start-3 font-medium">
        {raffle.quantityNumbers - raffle.boughtTickets}
      </p>
      <p className="md:col-start-3 font-semibold">Fecha de creación</p>
      <p className="text-sm font-extralight md:col-start-3 font-medium" suppressHydrationWarning>
        {formatDate(raffle.createdAt)}
      </p>
      <p className="md:col-start-3 font-semibold">Creado por</p>
      <p className="text-sm font-extralight md:col-start-3 font-medium">{raffle.owner.name}</p>
      {includeLinkToDetails && (
        <Link href={`/raffle/${raffle.id}`}>
          <button className="p-2 mt-4 transition-transform rounded md:hover:scale-105 bg-blue-700 dark:bg-blue-900 text-slate-50 dark:text-slate-200">
            Ver detalles
          </button>
        </Link>
      )}
    </div>
  );
}
