'use client';

import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import { IVoucher } from '@/types';
import { formatDate } from '@/utils';

interface RaffleVoucherCardProps {
  voucher: IVoucher;
  disableAnimations?: boolean;
}

export default function RaffleVoucherCard({
  voucher,
  disableAnimations = true,
}: RaffleVoucherCardProps) {
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    setCreatedAt(formatDate(voucher.createdAt));
  }, [voucher]);

  return (
    <div
      className={classNames(
        'width secondary-background-color padding margin-bottom rounded-2xl transition-transform grid grid-cols-1 md:grid-cols-3 grid-rows-4 md:grid-rows-8 md:gap-x-8 gap-2 shadow-lg min-h-12',
        {
          'md:hover:scale-[1.01]': !disableAnimations,
        },
      )}
    >
      <p className="md:col-start-3 font-semibold">Fecha de compra</p>
      <p className="text-sm font-extralight font-medium md:col-start-3" suppressHydrationWarning>
        {createdAt}
      </p>
      <p
        className="text-sm font-extralight font-medium md:col-start-1 row-end-5 row-start-1 md:row-span-full md:col-span-2"
        suppressHydrationWarning
      >
        <StorageImage path={`public/${voucher.url}`} alt="Factura de compra" />
      </p>
      <p className="font-extralight font-semibold md:col-start-3" suppressHydrationWarning>
        Es válida la factura?
      </p>
      <div className="md:col-start-3 flex gap">
        <button className="grow button-padding transition-transform rounded-md transition-colors primary-button-colors">
          Sí
        </button>
        <button className="grow button-padding transition-transform rounded-md transition-colors secondary-button-colors">
          No
        </button>
      </div>
    </div>
  );
}
