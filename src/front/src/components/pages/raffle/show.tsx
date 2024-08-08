'use client';

import { useState, useEffect } from 'react';

import RaffleCard from '@/components/raffle/raffle-card';
import { range } from '@/utils';
import { IRaffle } from '@/types/raffle';
import PaymentModal from '@/components/payment-modal';

type RaffleShowProps = {
  raffle: IRaffle;
  availableNumbers: Array<number>;
};

export default function RaffleShow({ raffle, availableNumbers }: RaffleShowProps) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const selectNumber = (number: number) => {
    setSelectedNumber(number);
  };

  useEffect(() => {
    if (!openModal) {
      setSelectedNumber(null);
    }
  }, [openModal]);

  useEffect(() => {
    if (selectedNumber != null) {
      setOpenModal(true);
    }
  }, [selectedNumber]);

  return (
    <main className="mt-8 text-slate-700 dark:text-slate-200">
      {openModal && (
        <PaymentModal title={`Desea comprar el número ${selectedNumber}?`} onClose={setOpenModal} />
      )}
      <h1 className="w-[95%] md:w-11/12 mx-auto mb-8 text-5xl">Información acerca de la rifa</h1>
      <RaffleCard raffle={raffle} />
      <h2 className="w-[95%] md:w-11/12 mx-auto mb-8 text-3xl font-medium">
        Números disponibles para compra
      </h2>
      <div className="w-[95%] md:w-11/12 mx-auto md:p-4 mb-4 rounded-2xl flex justify-center bg-slate-50 dark:bg-slate-900 shadow-lg">
        <div className="grid grid-cols-10 grid-rows-10 w-full md:w-fit place-items-center relative">
          {range(0, raffle.lastAvailableNumber, 1).map((x) => {
            const isNumberBought = !availableNumbers.includes(x);
            return (
              <button
                key={x}
                className={`w-10 h-10 relative ${isNumberBought ? 'cursor-not-allowed' : 'cursor-pointer md:hover:dark:bg-blue-900 transition-transform duration-300'}`}
                onClick={() => selectNumber(x)}
                disabled={isNumberBought}
              >
                <div className="border border-solid text-center relative leading-10">{x}</div>
                {isNumberBought && (
                  <div className="absolute top-1/2 left-1/2 h-[60%] w-[60%] translate-y-[-50%] translate-x-[-50%] bg-black dark:bg-slate-200 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
