'use client';

import { range } from '@/utils';
import { IRaffle } from '@/types/raffle';

type AvailableNumbersProps = {
  raffle: IRaffle;
  availableNumbers: Array<number>;
  selectedNumbers: Array<number>;
  selectOrUnselectNumber: (raffleNumber: number) => void;
};

export default function AvailableNumbers({
  raffle,
  availableNumbers,
  selectedNumbers,
  selectOrUnselectNumber,
}: AvailableNumbersProps) {
  const isNumberSelected = (raffleNumber: number) => {
    return selectedNumbers.includes(raffleNumber);
  };

  return (
    <div className="grid grid-cols-10 grid-rows-10 w-full md:w-fit place-items-center relative">
      {range(0, raffle.lastAvailableNumber, 1).map((x) => {
        const isNumberBought = !availableNumbers.includes(x);
        const isSelected = isNumberSelected(x);
        return (
          <button
            key={x}
            className={`w-10 h-10 relative ${isNumberBought ? 'cursor-not-allowed' : 'cursor-pointer md:hover:dark:bg-blue-900 transition-transform duration-300'}`}
            onClick={() => selectOrUnselectNumber(x)}
            disabled={isNumberBought}
          >
            <div className="border border-solid text-center relative leading-10">{x}</div>
            {isNumberBought && (
              <div className="absolute top-1/2 left-1/2 h-[60%] w-[60%] translate-y-[-50%] translate-x-[-50%] bg-black dark:bg-slate-200 rounded-full" />
            )}
            {isSelected && (
              <div className="absolute top-1/2 left-1/2 h-[60%] w-[60%] translate-y-[-50%] translate-x-[-50%] bg-green-700 dark:bg-green-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
