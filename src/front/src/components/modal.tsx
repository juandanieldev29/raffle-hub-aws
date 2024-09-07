'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface ModalProps {
  onClose: Dispatch<SetStateAction<boolean>>;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  boldMessage?: string;
  shouldConfirmRead?: boolean;
}

export default function Modal({
  onClose,
  onConfirm,
  title,
  message,
  boldMessage,
  shouldConfirmRead,
}: ModalProps) {
  const [confirmRead, setConfirmRead] = useState(true);

  const cancel = () => {
    onClose(false);
  };

  const confirm = () => {
    onConfirm();
  };

  const toggleConfirmRead = () => {
    setConfirmRead(!confirmRead);
  };

  useEffect(() => {
    if (shouldConfirmRead) {
      setConfirmRead(false);
    }
  }, [shouldConfirmRead]);

  return (
    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <div className="relative transform rounded-md secondary-background-color shadow-xl transition-all small-padding w-11/12 md:w-fit max-w-md">
            <h3 className="text-lg font-semibold text-center">{title}</h3>
            <div className="small-margin-top">
              <p className="text-sm">{message}</p>
            </div>
            {boldMessage && (
              <div className="small-margin-top">
                <p className="text-sm font-bold">{boldMessage}</p>
              </div>
            )}
            {shouldConfirmRead && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  onChange={toggleConfirmRead}
                  className="small-margin-right small-margin-top h-4 w-4"
                />
                <label className="small-margin-top">Confirmo que he leído</label>
              </div>
            )}
            <div className="margin-top flex items-center justify-end gap-x-4">
              <button
                type="button"
                className="rounded-md button-padding text-sm shadow-sm secondary-button-colors"
                onClick={cancel}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md button-padding text-sm shadow-sm transition-colors primary-button-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={confirm}
                disabled={!confirmRead}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
