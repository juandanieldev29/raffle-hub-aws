'use client';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { range } from '@/utils';

interface PaginationProps {
  totalResuls: number;
  pageSize?: number;
  setPage: Dispatch<SetStateAction<number>>;
  activePage: number;
}

const Pagination = ({ totalResuls, pageSize = 10, setPage, activePage }: PaginationProps) => {
  const [pages, setPages] = useState<Array<number>>([]);

  useEffect(() => {
    const resultsByPageSize = Math.ceil(totalResuls / pageSize);
    const stop = Math.max(resultsByPageSize);
    const rangePages = range(1, stop, 1);
    setPages(rangePages);
  }, [totalResuls, pageSize]);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-md">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm">
            Showing 1 to {pageSize} of {totalResuls} results
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              className="relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 enabled:hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-75 disabled:cursor-not-allowed"
              disabled={activePage === pages[0]}
              onClick={() => setPage(activePage - 1)}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                data-slot="icon"
              >
                <path
                  fillRule="evenodd"
                  d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {pages.map((x) => {
              return (
                <button
                  key={x}
                  aria-current="page"
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 disabled:cursor-not-allowed ${x === activePage ? 'z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'ring-1 ring-inset ring-gray-300 focus:outline-offset-0'}`}
                  onClick={() => setPage(x)}
                  disabled={x === activePage}
                >
                  {x}
                </button>
              );
            })}
            <button
              className="relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 disabled:opacity-75 disabled:cursor-not-allowed"
              disabled={activePage === pages.at(-1)}
              onClick={() => setPage(activePage + 1)}
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                data-slot="icon"
              >
                <path
                  fillRule="evenodd"
                  d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
