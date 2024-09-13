'use client';
import { useContext, useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from '@aws-amplify/auth';
import { toast } from 'react-toastify';

import RafflePaymentCard from '@/components/raffle/raffle-payment-card';
import RaffleVoucherCard from '@/components/raffle/raffle-voucher-card';
import Accordion from '@/components/accordion';
import { LoadingContext } from '@/contexts/loading-context';
import { LoadingAction } from '@/enums/loading-action';
import { IPaymentStatus, IVoucherStatus } from '@/types';
import { IVoucher, IPayment } from '@/types';

type RaffleBillingProps = {
  vouchers: IVoucher[];
  payments: IPayment[];
};

export default function RaffleBilling({ vouchers, payments }: RaffleBillingProps) {
  const { dispatch } = useContext(LoadingContext);
  const [completedPayments, setCompletedPayments] = useState<IPayment[]>([]);
  const [completedVouchers, setCompletedVouchers] = useState<IVoucher[]>([]);
  const [pendingVouchers, setPendingVouchers] = useState<IVoucher[]>([]);

  const approveVoucher = async (voucher: IVoucher) => {
    const payload = {
      voucherId: voucher.id,
    };
    if (!voucher.id) {
      toast.error('La factura no tiene una identificación válida', {
        position: 'top-center',
        theme: 'colored',
      });
      return;
    }
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      const session = await fetchAuthSession();
      if (!session.tokens?.idToken) {
        toast.error('Debes iniciar sesión para aprobar una factura', {
          position: 'top-center',
          theme: 'colored',
        });
        return;
      }
      const idToken = session.tokens.idToken.toString();
      await fetch(`https://api.raffle-hub.net/voucher/${voucher.raffleId}/approve`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        credentials: 'same-origin',
        cache: 'no-store',
        method: 'POST',
        body: JSON.stringify(payload),
      });
      toast.success('La factura ha sido aprovada', {
        position: 'top-center',
        theme: 'colored',
      });
    } catch (err) {
      toast.error('Ha ocurrido un error', {
        position: 'top-center',
        theme: 'colored',
      });
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  };

  useEffect(() => {
    setCompletedPayments(payments.filter((x) => x.status === IPaymentStatus.Complete));
  }, [payments]);

  useEffect(() => {
    setCompletedVouchers(vouchers.filter((x) => x.status === IVoucherStatus.Complete));
    setPendingVouchers(vouchers.filter((x) => x.status === IVoucherStatus.PendingVerification));
  }, [payments]);

  return (
    <Authenticator socialProviders={['google']} signUpAttributes={['email']}>
      <h1 className="width margin-bottom text-4xl md:text-5xl">Detalles de facturación</h1>
      <Accordion
        containerClassname="width"
        titleClassname="text-2xl md:text-3xl font-medium"
        title="Pagos con SINPE móvil pendientes de verificación"
        initiallyOpen
      >
        {!Boolean(pendingVouchers.length) && (
          <div className="secondary-background-color padding margin-bottom rounded-2xl transition-transform gap shadow-lg flex items-center">
            <i className="fa-solid fa-circle-info" />
            <span>No hay datos</span>
          </div>
        )}
        {pendingVouchers.map((x) => {
          return (
            <RaffleVoucherCard
              key={x.id}
              voucher={x}
              displayValidationControls
              approveVoucher={approveVoucher}
            />
          );
        })}
      </Accordion>

      <Accordion
        containerClassname="width"
        titleClassname="text-2xl md:text-3xl font-medium"
        title="Pagos completados con tarjeta"
      >
        {!Boolean(completedPayments.length) && (
          <div className="secondary-background-color padding margin-bottom rounded-2xl transition-transform gap shadow-lg flex items-center">
            <i className="fa-solid fa-circle-info" />
            <span>No hay datos</span>
          </div>
        )}
        {completedPayments.map((x) => {
          return <RafflePaymentCard key={x.id} payment={x} />;
        })}
      </Accordion>

      <Accordion
        containerClassname="width"
        titleClassname="text-2xl md:text-3xl font-medium"
        title="Pagos completados con SINPE móvil completados"
      >
        {!Boolean(completedVouchers.length) && (
          <div className="secondary-background-color padding margin-bottom rounded-2xl transition-transform gap shadow-lg flex items-center">
            <i className="fa-solid fa-circle-info" />
            <span>No hay datos</span>
          </div>
        )}
        {completedVouchers.map((x) => {
          return <RaffleVoucherCard key={x.id} voucher={x} displayValidationControls={false} />;
        })}
      </Accordion>
    </Authenticator>
  );
}
