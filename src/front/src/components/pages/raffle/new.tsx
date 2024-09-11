'use client';

import { useContext, useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from '@aws-amplify/auth';
import { toast } from 'react-toastify';

import { replacer } from '@/utils';
import { LoadingContext } from '@/contexts/loading-context';
import { LoadingAction } from '@/enums/loading-action';
import { navigateToRaffleDetail, navigateToHome } from '@/app/actions';
import { IRaffle } from '@/types';
import DatePicker from '@/components/date/date-picker';

export default function RaffleNew() {
  const { dispatch } = useContext(LoadingContext);
  const [description, setDescription] = useState<string | null>(null);
  const [prize, setPrize] = useState<number | null>(null);
  const [ticketPrice, setTicketPrice] = useState<number | null>(null);
  const [quantityNumbers, setQuantityNumbers] = useState<number | null>(null);
  const [quantitySeries, setQuantitySeries] = useState<number | null>(null);
  const [overwriteQuantityNumbers, setOverwriteQuantityNumbers] = useState(false);
  const [completionDate, setCompletionDate] = useState(new Date());
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
      completionDate,
    };
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      const session = await fetchAuthSession();
      if (!session.tokens?.idToken) {
        toast.error('Debes iniciar sesión para crear una rifa', {
          position: 'top-center',
          theme: 'colored',
        });
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
      await navigateToRaffleDetail(raffle.id, raffle.ownerId);
    } catch (err) {
      toast.error('Ha ocurrido un error', {
        position: 'top-center',
        theme: 'colored',
      });
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
        className="width shadow-lg padding rounded-2xl secondary-background-color"
        onSubmit={onSubmit}
      >
        <h1 className="text-4xl md:text-5xl">Crear nueva rifa</h1>
        <div className="border-b border-gray-900/10 section-divider-padding margin-top">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label htmlFor="description" className="block font-medium leading-6 text-xl">
                Descripción
              </label>
              <div className="margin-top">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 button-padding"
                  required
                  maxLength={255}
                  onChange={({ target }) => setDescription(target.value)}
                ></textarea>
              </div>
              <p className="text-lg">
                Agrega una descripción para que los usuarios sepan sobre el motivo de la rifa
              </p>
            </div>
          </div>
        </div>

        <div className="section-divider-padding margin-top flex flex-col items-center">
          <p className="self-start text-xl margin-bottom">Fecha y hora a realizarse la rifa</p>
          <DatePicker onSelectDate={setCompletionDate} />
        </div>

        <div className="border-b border-gray-900/10 section-divider-padding margin-top">
          <p className="text-xl">
            Agrega información sobre cuantos números va a tener la rifa y cual va a ser el premio
          </p>
          <div className="relative flex flex-col md:flex-row gap-x-3 margin-bottom margin-top">
            <div className="flex h-6 items-center">
              <input
                id="include-series"
                name="include-series"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                onChange={({ target }) => setIncludeSeries(target.checked)}
              />
            </div>
            <div className="text-sm">
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
            <div className="text-sm">
              <label htmlFor="series" className="font-medium text-base">
                Cantidad de números
              </label>
              <p>La rifa va a tener mas de 100 números?</p>
            </div>
          </div>
          <div className="margin-top grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-5">
            <div className="sm:col-span-1 sm:col-start-1">
              <label htmlFor="prize" className="block text-base	font-medium">
                Premio
              </label>
              <div className="margin-top">
                <input
                  type="number"
                  name="prize"
                  id="prize"
                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 button-padding"
                  required
                  onChange={({ target }) => setPrize(Number.parseInt(target.value, 10))}
                />
              </div>
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="ticketPrice" className="block text-base font-medium leading-6">
                Precio del número
              </label>
              <div className="margin-top">
                <input
                  type="number"
                  name="ticketPrice"
                  id="ticketPrice"
                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 button-padding"
                  required
                  onChange={({ target }) => setTicketPrice(Number.parseInt(target.value, 10))}
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="quantityNumbers" className="block text-base font-medium leading-6">
                Cantidad de números
              </label>
              <div className="margin-top">
                <input
                  type="number"
                  name="quantityNumbers"
                  id="quantityNumbers"
                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 button-padding"
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
                <div className="margin-top">
                  <input
                    type="number"
                    name="quantitySeries"
                    id="quantitySeries"
                    className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 button-padding"
                    placeholder="1000"
                    required
                    onChange={({ target }) => setQuantitySeries(Number.parseInt(target.value, 10))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="margin-top flex items-center justify-end gap-x-6">
          <button
            type="button"
            className="rounded-md button-padding text-sm shadow-sm secondary-button-colors"
            onClick={cancel}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-md button-padding text-sm shadow-sm transition-colors primary-button-colors"
          >
            Guardar
          </button>
        </div>
      </form>
    </Authenticator>
  );
}
