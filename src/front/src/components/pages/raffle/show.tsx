'use client';

import { useEffect, useState } from 'react';

import RaffleCard from '@/components/raffle/raffle-card';
import { IRaffle } from '@/types/raffle';
import AvailableNumbers from '@/components/raffle/available-numbers';
import { formatNumber } from '@/utils';

type RaffleShowProps = {
  raffle: IRaffle;
  availableNumbers: Array<number>;
};

export default function RaffleShow({ raffle, availableNumbers }: RaffleShowProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<Array<number>>([]);
  const [priceToPay, setPriceToPay] = useState(0);

  const selectOrUnselectNumber = (raffleNumber: number) => {
    let numbers = [...selectedNumbers];
    if (isNumberSelected(raffleNumber)) {
      numbers = numbers.filter((x) => {
        return x !== raffleNumber;
      });
    } else {
      numbers = [...numbers, raffleNumber];
    }
    setSelectedNumbers(numbers);
  };

  const isNumberSelected = (raffleNumber: number) => {
    return selectedNumbers.includes(raffleNumber);
  };

  const calculatePriceToPay = () => {
    return selectedNumbers.reduce((accumulator, currentValue) => {
      return accumulator + raffle.ticketPrice;
    }, 0);
  };

  useEffect(() => {
    const price = calculatePriceToPay();
    setPriceToPay(price);
  }, [selectedNumbers]);

  return (
    <>
      <h1 className="width margin-bottom text-4xl md:text-5xl">Información acerca de la rifa</h1>
      <RaffleCard raffle={raffle} />
      <h2 className="width margin-bottom text-2xl md:text-3xl font-medium">
        Números disponibles para compra
      </h2>
      <div className="width flex flex-col md:flex-row">
        <div className="flex items-center">
          <span>Número no disponible</span>
          <div className="relative w-10 h-10">
            <div className="absolute top-1/2 left-1/2 h-[60%] w-[60%] translate-y-[-50%] translate-x-[-50%] bg-black dark:bg-slate-200 rounded-full" />
          </div>
        </div>
        <div className="flex items-center">
          <span>Número seleccionado</span>
          <div className="relative w-10 h-10">
            <div className="absolute top-1/2 left-1/2 h-[60%] w-[60%] translate-y-[-50%] translate-x-[-50%] bg-green-700 dark:bg-green-500 rounded-full" />
          </div>
        </div>
      </div>
      {selectedNumbers.length && (
        <>
          <p className="width">
            Cantidad de número seleccionados:{' '}
            <span className="font-bold text-sm">{selectedNumbers.length}</span>
          </p>
          <p className="width small-margin-bottom">
            Total a pagar: <span className="font-bold text-sm">{formatNumber(priceToPay)}</span>
          </p>
        </>
      )}
      <div className="width flex flex-wrap">
        {selectedNumbers.map((x) => {
          return (
            <span className="secondary-background-color w-8 h-8 flex items-center justify-center rounded-full text-center align-middle border relative small-margin-right small-margin-bottom">
              {x}
            </span>
          );
        })}
      </div>
      <div className="width md:padding flex justify-center secondary-background-color shadow-lg">
        <AvailableNumbers
          raffle={raffle}
          availableNumbers={availableNumbers}
          selectedNumbers={selectedNumbers}
          selectOrUnselectNumber={selectOrUnselectNumber}
        />
      </div>
    </>
  );
}
