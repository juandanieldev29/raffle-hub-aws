'use client';
import { useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import RafflePaymentCard from '@/components/raffle/raffle-payment-card';
import RaffleVoucherCard from '@/components/raffle/raffle-voucher-card';
import Accordion from '@/components/accordion';
import { IPaymentStatus, IVoucherStatus } from '@/types';
import { IVoucher, IPayment } from '@/types';

type RaffleBillingProps = {
  vouchers: IVoucher[];
  payments: IPayment[];
};

export default function RaffleBilling({ vouchers, payments }: RaffleBillingProps) {
  const [completedPayments, setCompletedPayments] = useState<IPayment[]>([]);
  const [completedVouchers, setCompletedVouchers] = useState<IVoucher[]>([]);
  const [pendingVouchers, setPendingVouchers] = useState<IVoucher[]>([]);

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
        title="Pagos con SINPE movil pendientes de verificación"
        initiallyOpen
      >
        {!Boolean(pendingVouchers.length) && (
          <div className="secondary-background-color padding margin-bottom rounded-2xl transition-transform gap shadow-lg flex items-center">
            <i className="fa-solid fa-circle-info" />
            <span>No hay datos</span>
          </div>
        )}
        {pendingVouchers.map((x) => {
          return <RaffleVoucherCard key={x.id} voucher={x} />;
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
        title="Pagos completados con SINPE movil completados"
      >
        {!Boolean(completedVouchers.length) && (
          <div className="secondary-background-color padding margin-bottom rounded-2xl transition-transform gap shadow-lg flex items-center">
            <i className="fa-solid fa-circle-info" />
            <span>No hay datos</span>
          </div>
        )}
        {completedVouchers.map((x) => {
          return <RaffleVoucherCard key={x.id} voucher={x} />;
        })}
      </Accordion>
    </Authenticator>
  );
}
