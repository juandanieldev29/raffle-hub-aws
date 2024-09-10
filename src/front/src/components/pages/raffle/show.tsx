'use client';

import { useEffect, useState, useContext } from 'react';
import { fetchAuthSession } from '@aws-amplify/auth';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

import { navigateTo } from '@/app/actions';
import RaffleCard from '@/components/raffle/raffle-card';
import Modal from '@/components/modal';
import FileUploadModal from '@/components/file-upload-modal';
import AvailableNumbers from '@/components/raffle/available-numbers';
import { formatNumber } from '@/utils';
import { LoadingContext } from '@/contexts/loading-context';
import { LoadingAction } from '@/enums/loading-action';
import { IRaffle, IPayment, IVoucher } from '@/types';

type RaffleShowProps = {
  raffle: IRaffle;
  availableNumbers: Array<number>;
};

type NewTicketPayload = Array<{
  number: number;
  paymentId?: string;
  voucherId?: string;
}>;

export default function RaffleShow({ raffle, availableNumbers }: RaffleShowProps) {
  const { dispatch } = useContext(LoadingContext);
  const [displayCardPaymentModal, setDisplayCardPaymentModal] = useState(false);
  const [displaySinpeModal, setDisplaySinpeModal] = useState(false);
  const [displayFileUploadModal, setDisplayFileUploadModal] = useState(false);
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
    return selectedNumbers.reduce((accumulator) => {
      return accumulator + raffle.ticketPrice;
    }, 0);
  };

  const openCardPaymentModal = () => {
    setDisplayCardPaymentModal(true);
  };

  const closeCardPaymentModal = () => {
    setDisplayCardPaymentModal(false);
  };

  const openSinpePaymentModal = () => {
    setDisplaySinpeModal(true);
  };

  const closeSinpePaymentModal = () => {
    setDisplaySinpeModal(false);
  };

  const openFileUploadModal = () => {
    setDisplayFileUploadModal(true);
  };

  const closeFileUploadModal = () => {
    setDisplayFileUploadModal(false);
  };

  const confirmSinpePayment = () => {
    closeSinpePaymentModal();
    openFileUploadModal();
  };

  const generatePaymentLink = async (idToken?: string) => {
    const payload = selectedNumbers.map((selectedNumber) => {
      return {
        number: selectedNumber,
        ticketPrice: raffle.ticketPrice,
      };
    });
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      const res = await fetch(
        `https://api.raffle-hub.net/payment/${raffle.id}?ownerId=${raffle.ownerId}`,
        {
          headers: idToken
            ? {
                Authorization: `Bearer ${idToken}`,
              }
            : undefined,
          cache: 'no-store',
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
      const payment: IPayment = await res.json();
      return payment;
    } catch (err) {
      toast.error('No se pudo generar el link del pago', {
        position: 'top-center',
        theme: 'colored',
      });
      throw err;
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  };

  const generateVoucherLink = async (voucherURL: string, idToken?: string) => {
    const payload = {
      voucherURL,
    };
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      const res = await fetch(`https://api.raffle-hub.net/voucher/${raffle.id}`, {
        headers: idToken
          ? {
              Authorization: `Bearer ${idToken}`,
            }
          : undefined,
        cache: 'no-store',
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const voucher: IVoucher = await res.json();
      return voucher;
    } catch (err) {
      toast.error('No se pudo generar el link del pago', {
        position: 'top-center',
        theme: 'colored',
      });
      throw err;
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  };

  const generateCardPaymentPayload = (paymentId: string) => {
    return selectedNumbers.map((selectedNumber) => {
      return {
        number: selectedNumber,
        paymentId,
      };
    });
  };

  const generateVoucherPaymentPayload = (voucherId: string) => {
    return selectedNumbers.map((selectedNumber) => {
      return {
        number: selectedNumber,
        voucherId,
      };
    });
  };

  const generateTicket = async (payload: NewTicketPayload) => {
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      const res = await fetch(
        `https://api.raffle-hub.net/ticket/${raffle.id}?ownerId=${raffle.ownerId}`,
        {
          cache: 'no-store',
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
      const payment: IRaffle = await res.json();
      return payment;
    } catch (err) {
      toast.error('No se pudo generar el tiquete', {
        position: 'top-center',
        theme: 'colored',
      });
      throw err;
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  };

  const fetchSession = async () => {
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch (err) {
      toast.error('No se pudo obtener la sesión del usuario', {
        position: 'top-center',
        theme: 'colored',
      });
      throw err;
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  };

  const confirmPurchase = async () => {
    try {
      const idToken = await fetchSession();
      const payment = await generatePaymentLink(idToken);
      const payload = generateCardPaymentPayload(payment.id);
      await generateTicket(payload);
      navigateTo(payment.url);
    } catch (err) {
      toast.error('Ha ocurrido un error', {
        position: 'top-center',
        theme: 'colored',
      });
    }
  };

  const confirmVoucher = async (voucherURL: string) => {
    try {
      const idToken = await fetchSession();
      const voucher = await generateVoucherLink(voucherURL, idToken);
      const payload = generateVoucherPaymentPayload(voucher.id);
      await generateTicket(payload);
    } catch (err) {
      toast.error('Ha ocurrido un error', {
        position: 'top-center',
        theme: 'colored',
      });
    }
  };

  useEffect(() => {
    const price = calculatePriceToPay();
    setPriceToPay(price);
  }, [selectedNumbers]);

  return (
    <>
      {displayCardPaymentModal && (
        <Modal
          title={`Confirmar compra con tarjeta`}
          message={`Estás a punto de comprar los números ${selectedNumbers.join(', ')} y pagar un total de ${formatNumber(priceToPay)}`}
          boldMessage={`Tendrás 10 minutos para realizar la compra`}
          onClose={closeCardPaymentModal}
          onConfirm={confirmPurchase}
        />
      )}
      {displaySinpeModal && (
        <Modal
          title={`Confirmar compra con SINPE móvil`}
          message={`Estás a punto de comprar los números ${selectedNumbers.join(', ')} y pagar un total de ${formatNumber(priceToPay)}`}
          boldMessage={`Es importante que adjuntes una imagen con la transferencia SINPE, asi el dueño de la rifa podrá verificar el pago`}
          onClose={closeSinpePaymentModal}
          onConfirm={confirmSinpePayment}
          shouldConfirmRead
        />
      )}
      {displayFileUploadModal && (
        <FileUploadModal
          title={`Subir imagen de comprobante de transferencia SINPE`}
          message={`El dueño de la rifa deberá validar que la transferencia SINPE sea válida`}
          fileUploadPath={`${raffle.ownerId}/${raffle.id}/`}
          fileUploadFilename={`${uuidv4()}`}
          onClose={closeFileUploadModal}
          onConfirm={confirmVoucher}
        />
      )}
      <h1 className="width margin-bottom text-4xl md:text-5xl">Información acerca de la rifa</h1>
      <RaffleCard raffle={raffle} />
      <h2 className="width margin-bottom text-2xl md:text-3xl font-medium">
        Números disponibles para compra
      </h2>
      <div className="width secondary-background-color padding margin-bottom shadow-lg">
        <div className="flex flex-col md:flex-row">
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
        <p>
          Cantidad de número seleccionados:
          <span className="font-bold text-sm"> {selectedNumbers.length}</span>
        </p>
        <p className="small-margin-bottom">
          Total a pagar:<span className="font-bold text-sm"> {formatNumber(priceToPay)}</span>
        </p>
        <div className="flex gap small-margin-bottom">
          <button
            onClick={openCardPaymentModal}
            className="button-padding transition-transform rounded-md transition-colors primary-button-colors enabled:cursor-pointer disabled:cursor-not-allowed disabled:cursor-not-allowed disabled:opacity-25"
            disabled={!selectedNumbers.length}
          >
            Pago con tarjeta
          </button>
          <button
            onClick={openSinpePaymentModal}
            className="button-padding transition-transform rounded-md transition-colors primary-button-colors enabled:cursor-pointer disabled:cursor-not-allowed disabled:cursor-not-allowed disabled:opacity-25"
            disabled={!selectedNumbers.length}
          >
            Pago con SINPE móvil
          </button>
        </div>
        <div className="flex flex-wrap">
          {selectedNumbers.map((x) => {
            return (
              <span
                key={x}
                className="secondary-background-color w-8 h-8 flex items-center justify-center rounded-full border relative small-margin-right small-margin-bottom"
              >
                {x}
              </span>
            );
          })}
        </div>
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
