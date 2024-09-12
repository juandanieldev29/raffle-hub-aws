'use client';

import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { IPayment } from '@/types';
import { formatNumber, formatDate } from '@/utils';

interface RafflePaymentCardProps {
  payment: IPayment;
  disableAnimations?: boolean;
}

export default function RafflePaymentCard({
  payment,
  disableAnimations = true,
}: RafflePaymentCardProps) {
  const [paymentTotal, setPaymentTotal] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    setCreatedAt(formatDate(payment.createdAt));
    if (payment.total) {
      setPaymentTotal(formatNumber(payment.total / 100));
    }
  }, [payment]);

  return (
    <div
      className={classNames(
        'secondary-background-color padding margin-bottom rounded-2xl transition-transform grid grid-rows-6 md:gap-x-8 gap-2 shadow-lg',
        {
          'md:hover:scale-[1.01]': !disableAnimations,
        },
      )}
    >
      <p className="font-semibold">Nombre del comprador</p>
      <p className="text-sm font-extralight font-medium" suppressHydrationWarning>
        {payment.customerDetails?.name}
      </p>
      <p className="font-semibold">Correo electrónico del comprador</p>
      <p className="text-sm font-extralight font-medium" suppressHydrationWarning>
        {payment.customerDetails?.email}
      </p>
      <p className="font-semibold">Total de la compra</p>
      <p className="text-sm font-extralight font-medium" suppressHydrationWarning>
        {paymentTotal}
      </p>
      <p className="font-semibold">Fecha de compra</p>
      <p className="text-sm font-extralight font-medium" suppressHydrationWarning>
        {createdAt}
      </p>
    </div>
  );
}
