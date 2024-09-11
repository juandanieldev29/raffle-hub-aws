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
        'width secondary-background-color padding margin-bottom rounded-2xl transition-transform grid grid-rows-6 md:gap-x-8 gap-2 shadow-lg min-h-12',
        {
          'md:hover:scale-[1.01]': !disableAnimations,
        },
      )}
    >
      <p className="font-semibold">Imagen de factura</p>
      <p className="text-sm font-extralight font-medium" suppressHydrationWarning>
        <StorageImage path={`public/${voucher.url}`} alt="Factura de compra" />
      </p>
      <p className="font-semibold">Fecha de compra</p>
      <p className="text-sm font-extralight font-medium" suppressHydrationWarning>
        {createdAt}
      </p>
    </div>
  );
}
