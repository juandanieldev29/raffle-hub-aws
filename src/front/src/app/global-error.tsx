'use client';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError() {
  return (
    <html lang="es">
      <body className={`${inter.className} default-background-color default-color-text`}>
        <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Ha ocurrido un error
            </h1>
            <p className="mt-6 text-base leading-7">
              Lo lamentamos, ha ocurrido un error inesperado
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/"
                className="button-padding transition-transform rounded-md transition-colors primary-button-colors"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
