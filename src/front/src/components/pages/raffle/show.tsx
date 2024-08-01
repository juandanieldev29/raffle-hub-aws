'use client';

import RaffleCard from '@/components/raffle/raffle-card';
import { range } from '@/utils';
import { IRaffle } from '@/types/raffle';

type RaffleShowProps = {
  raffle: IRaffle;
};

export default function RaffleShow({ raffle }: RaffleShowProps) {
  return (
    <main className="mt-8 text-slate-700 dark:text-slate-200">
      <h1 className="w-[95%] md:w-11/12 mx-auto mb-8 text-5xl">Información acerca de la rifa</h1>
      <RaffleCard raffle={raffle} />
      <h2 className="w-[95%] md:w-11/12 mx-auto mb-8 text-3xl font-medium">
        Números disponibles para compra
      </h2>
      <div className="w-[95%] md:w-11/12 mx-auto md:p-4 mb-4 rounded-2xl flex justify-center bg-slate-50 dark:bg-slate-900 shadow-lg">
        <div className="grid grid-cols-10 grid-rows-10 w-full md:w-fit place-items-center relative">
          {range(0, raffle.lastAvailableNumber, 1).map((x) => {
            return (
              <div
                key={x}
                className={`w-10 h-10 relative cursor-pointer md:hover:dark:bg-blue-900 transition-transform duration-300`}
              >
                <div className="border border-solid text-center relative leading-10">{x}</div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
