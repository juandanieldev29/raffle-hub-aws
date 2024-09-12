'use client';

import { ReactNode, useState } from 'react';
import classNames from 'classnames';

interface AccordionProps {
  containerClassname?: string;
  title: string;
  titleClassname?: string;
  initiallyOpen?: boolean;
  children: ReactNode;
}

export default function Accordion({
  containerClassname,
  title,
  titleClassname,
  initiallyOpen,
  children,
}: AccordionProps) {
  const [open, setOpen] = useState(initiallyOpen ?? false);

  return (
    <div className={classNames('margin-bottom', containerClassname)}>
      <div className="flex margin-bottom items-center w-full border-b border-b-slate-200 dark:border-b-slate-50">
        <button
          className={classNames('text-left small-margin-right small-margin-bottom', titleClassname)}
          onClick={() => setOpen(!open)}
        >
          {title}
        </button>
        <span className="small-margin-bottom">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className={classNames('w-5 h-5 transition-all', {
              'rotate-180': open,
              'rotate-0': !open,
            })}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              fillRule="evenodd"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
      <div className={classNames({ 'h-0 overflow-hidden': !open })}>{children}</div>
    </div>
  );
}
