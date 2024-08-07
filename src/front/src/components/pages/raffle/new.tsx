'use client';
import { useContext, useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from '@aws-amplify/auth';

import { replacer } from '@/utils';
import { LoadingContext } from '@/contexts/loading-context';
import { LoadingAction } from '@/enums/loading-action';
import { navigateToRaffleDetail, navigateToHome } from '@/app/actions';
import { IRaffle } from '@/types/raffle';

export default function RaffleNew() {
  const { dispatch } = useContext(LoadingContext);
  const [description, setDescription] = useState<string | null>(null);
  const [prize, setPrize] = useState<number | null>(null);
  const [ticketPrice, setTicketPrice] = useState<number | null>(null);
  const [quantityNumbers, setQuantityNumbers] = useState<number | null>(null);
  const [quantitySeries, setQuantitySeries] = useState<number | null>(null);
  const [overwriteQuantityNumbers, setOverwriteQuantityNumbers] = useState(false);
  const [includeSeries, setIncludeSeries] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createNewRaffle();
  };

  const createNewRaffle = async () => {
    const payload = {
      description,
      prize,
      ticketPrice,
      quantityNumbers,
      quantitySeries,
    };
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      const session = await fetchAuthSession();
      if (!session.tokens?.idToken) {
        console.error('ID Token not present in the current session');
        return;
      }
      const idToken = session.tokens.idToken.toString();
      const res = await fetch('https://api.raffle-hub.net/raffle', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        credentials: 'same-origin',
        cache: 'no-store',
        method: 'POST',
        body: JSON.stringify(payload, replacer),
      });
      const raffle: IRaffle = await res.json();
      await navigateToRaffleDetail(raffle.id);
    } catch (err) {
      console.log(err);
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  };

  const cancel = async (): Promise<void> => {
    await navigateToHome();
  };

  useEffect(() => {
    setQuantitySeries(null);
  }, [includeSeries]);

  return (
    <Authenticator socialProviders={['google']} signUpAttributes={['email']}>
      <form
        className="w-[95%] md:w-11/12 mx-auto shadow-lg p-4 rounded-2xl dark:bg-slate-900"
        onSubmit={onSubmit}
      >
        <h1 className="mb-8 text-5xl">Crear nueva rifa</h1>
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label htmlFor="description" className="block font-medium leading-6 text-xl">
                Descripción
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 p-1"
                  required
                  onChange={({ target }) => setDescription(target.value)}
                ></textarea>
              </div>
              <p className="mt-3 text-lg leading-6">
                Agrega una descripción para que los usuarios sepan sobre el motivo de la rifa
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-8">
          <p className="mt-1 text-xl leading-6">
            Agrega información sobre cuantos números va a tener la rifa y cual va a ser el premio
          </p>
          <div className="relative flex gap-x-3 my-4">
            <div className="flex h-6 items-center">
              <input
                id="include-series"
                name="include-series"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                onChange={({ target }) => setIncludeSeries(target.checked)}
              />
            </div>
            <div className="text-sm leading-6">
              <label htmlFor="series" className="font-medium text-base">
                Series
              </label>
              <p>Los números van a tener serie?</p>
            </div>
            <div className="flex h-6 items-center">
              <input
                id="series"
                name="series"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                onChange={({ target }) => setOverwriteQuantityNumbers(target.checked)}
              />
            </div>
            <div className="text-sm leading-6">
              <label htmlFor="series" className="font-medium text-base">
                Cantidad de números
              </label>
              <p>La rifa va a tener mas de 100 números?</p>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-5">
            <div className="sm:col-span-1 sm:col-start-1">
              <label htmlFor="prize" className="block text-base	font-medium leading-6">
                Premio
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="prize"
                  id="prize"
                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 p-1"
                  required
                  onChange={({ target }) => setPrize(Number.parseInt(target.value, 10))}
                />
              </div>
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="ticketPrice" className="block text-base font-medium leading-6">
                Precio del número
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="ticketPrice"
                  id="ticketPrice"
                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 p-1"
                  required
                  onChange={({ target }) => setTicketPrice(Number.parseInt(target.value, 10))}
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="quantityNumbers" className="block text-base font-medium leading-6">
                Cantidad de números
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="quantityNumbers"
                  id="quantityNumbers"
                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 p-1"
                  placeholder="100"
                  disabled={!overwriteQuantityNumbers}
                  onChange={({ target }) => setQuantityNumbers(Number.parseInt(target.value, 10))}
                />
              </div>
            </div>

            {includeSeries && (
              <div className="sm:col-span-1">
                <label htmlFor="quantitySeries" className="block text-base font-medium leading-6">
                  Cantidad de series
                </label>
                <div className="mt-2">
                  <input
                    type="number"
                    name="quantitySeries"
                    id="quantitySeries"
                    className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 p-1"
                    placeholder="1000"
                    onChange={({ target }) => setQuantitySeries(Number.parseInt(target.value, 10))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            className="p-2 mt-4 transition-transform rounded md:hover:scale-105 bg-yellow-300 dark:bg-blue-900 text-slate-900 dark:text-slate-200"
            onClick={cancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="p-2 mt-4 transition-transform rounded md:hover:scale-105 bg-blue-700 dark:bg-blue-900 text-slate-50 dark:text-slate-200"
          >
            Save
          </button>
        </div>
      </form>
    </Authenticator>
  );
}
