'use client';

import { Dispatch, SetStateAction } from 'react';
import StripeCheckout from 'react-stripe-checkout';

interface ModalProps {
  onClose: Dispatch<SetStateAction<boolean>>;
  title: string;
}

export default function PaymentModal({ onClose, title }: ModalProps) {
  const cancel = () => {
    onClose(false);
  };

  return (
    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base leading-6" id="modal-title">
                    {title}
                  </h3>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <StripeCheckout
                token={(token) => console.log(token)}
                stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!}
              >
                <button
                  type="button"
                  className="ml-3 rounded-md px-3 py-2 text-sm shadow-sm bg-blue-700 hover:bg-blue-900 dark:hover:bg-blue-800 dark:bg-blue-900 text-slate-50 dark:text-slate-200"
                >
                  Confirmar
                </button>
              </StripeCheckout>
              <button
                type="button"
                className="rounded-md px-3 py-2 text-sm bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                onClick={cancel}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
