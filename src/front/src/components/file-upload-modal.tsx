'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { StorageManager } from '@aws-amplify/ui-react-storage';
import { toast } from 'react-toastify';

interface FileUploadModalProps {
  onClose: Dispatch<SetStateAction<boolean>>;
  onConfirm: (fileURL: string) => Promise<void>;
  title: string;
  message: string;
  fileUploadPath: string;
  boldMessage?: string;
  shouldConfirmRead?: boolean;
}

export default function FileUploadModal({
  onClose,
  onConfirm,
  title,
  message,
  fileUploadPath,
  boldMessage,
  shouldConfirmRead,
}: FileUploadModalProps) {
  const [confirmRead, setConfirmRead] = useState(true);

  const processFile = ({ file }: { file: File }) => {
    return { file, key: fileUploadPath };
  };

  const cancel = () => {
    onClose(false);
  };

  const confirm = (fileURL: string) => {
    onConfirm(fileURL);
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
          <div className="relative transform rounded-md secondary-background-color shadow-xl transition-all small-padding w-11/12 lg:max-w-screen-md">
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
            <div className="small-margin-top">
              <StorageManager
                accessLevel="guest"
                acceptedFileTypes={['image/*']}
                path={fileUploadPath}
                maxFileCount={1}
                isResumable
                maxFileSize={5242880}
                onUploadError={() => {
                  toast.error('No se ha podido subir el archivo', {
                    position: 'top-center',
                    theme: 'colored',
                  });
                }}
                onUploadSuccess={({ key }) => {
                  console.log(key);
                  confirm(fileUploadPath);
                }}
                processFile={processFile}
                displayText={{
                  dropFilesText: 'Arrastre archivo aquí',
                  browseFilesText: 'Seleccione archivo',
                  getFilesUploadedText(count) {
                    return `${count} imagenes subidas`;
                  },
                }}
              />
            </div>
            <div className="margin-top flex items-center justify-end gap-x-4">
              <button
                type="button"
                className="rounded-md button-padding text-sm shadow-sm secondary-button-colors"
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
