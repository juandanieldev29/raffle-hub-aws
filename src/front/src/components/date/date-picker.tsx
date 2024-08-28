'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import classNames from 'classnames';

import { formatMinimumIntegerDigits, range } from '@/utils';

type DatePickerProps = {
  onSelectDate: Dispatch<SetStateAction<Date>>;
};

interface SelectDate {
  year?: number;
  month?: number;
  day?: number;
  hours?: number;
  minutes?: number;
  selectedHourFormat: string;
}

export default function DatePicker({ onSelectDate }: DatePickerProps) {
  const [months, setMonths] = useState<Array<string>>([]);
  const [days, setDays] = useState<Array<string>>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [selectedHour, setSelectedHour] = useState<number>(1);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(0);
  const [selectedHourFormat, setSelectedHourFormat] = useState<string>('AM');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [firstDayWeekday, setFirstDayWeekday] = useState<number | null>(4);
  const [lastDayWeekday, setLastDayWeekday] = useState<number | null>(null);

  const getMonthsForLocale = (locale: string) => {
    const currentYear = new Date().getFullYear();
    const format = new Intl.DateTimeFormat(locale, { month: 'long' });
    const months = [];
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 1, 0, 0, 0);
      months.push(format.format(date));
    }
    return months.map((month) => {
      return capitalizeFirstLetter(month);
    });
  };

  const getAmountOfDaysForMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getWeekdayForFirstDayOfMonth = (month: number, year: number) => {
    const weekday = new Date(year, month, 1).getDay();
    return weekday === 0 ? 6 : weekday - 1;
  };

  const getWeekdayForLastDayOfMonth = (month: number, year: number) => {
    const weekday = new Date(year, month + 1, 0).getDay();
    return weekday === 0 ? 6 : weekday - 1;
  };

  const getDaysForLocale = (locale: string) => {
    const daysOfWeek = [];
    const dateFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });

    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      const dayIndex = i === 7 ? 0 : i;
      const dayName = dateFormatter.format(
        new Date(date.setDate(date.getDate() - date.getDay() + dayIndex)),
      );
      daysOfWeek.push(dayName);
    }
    return daysOfWeek.map((x) => {
      return capitalizeFirstLetter(x);
    });
  };

  const capitalizeFirstLetter = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const goToPreviousMonth = () => {
    const previousMonth = getPreviousMonth();
    const previousYear = getPreviousYear();
    setSelectedMonth(previousMonth);
    setSelectedYear(previousYear);
  };

  const getPreviousMonth = () => {
    if (selectedMonth <= 0) {
      return months.length - 1;
    }
    return selectedMonth - 1;
  };

  const getPreviousYear = () => {
    if (selectedMonth <= 0) {
      return selectedYear - 1;
    }
    return selectedYear;
  };

  const getNextMonth = () => {
    if (selectedMonth >= months.length - 1) {
      return 0;
    }
    return selectedMonth + 1;
  };

  const getNextYear = () => {
    if (selectedMonth >= months.length - 1) {
      return selectedYear + 1;
    }
    return selectedYear;
  };

  const goToNextMonth = () => {
    const nextMonth = getNextMonth();
    const nextYear = getNextYear();
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
  };

  const isSelectedDateEqual = (year: number, month: number, day: number) => {
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
  };

  const isDateBefore = (dateToCompare: Date, dateToCompareAgainst: Date) => {
    if (dateToCompare.getFullYear() < dateToCompareAgainst.getFullYear()) {
      return true;
    }
    if (
      dateToCompare.getFullYear() === dateToCompareAgainst.getFullYear() &&
      dateToCompare.getMonth() < dateToCompareAgainst.getMonth()
    ) {
      return true;
    }
    return (
      dateToCompare.getFullYear() === dateToCompareAgainst.getFullYear() &&
      dateToCompare.getMonth() === dateToCompareAgainst.getMonth() &&
      dateToCompare.getDate() < dateToCompareAgainst.getDate()
    );
  };

  const includeNextWeekOfNextMonth = () => {
    if (firstDayWeekday === null || lastDayWeekday === null) {
      return 0;
    }
    const amountOfDays = getAmountOfDaysForMonth(selectedMonth, selectedYear);
    if (amountOfDays === 28 && lastDayWeekday === 6) {
      return 14;
    }
    if (amountOfDays <= 29) {
      return 7;
    }
    if (amountOfDays === 30 && firstDayWeekday < 6) {
      return 7;
    }
    if (amountOfDays >= 31 && firstDayWeekday < 5) {
      return 7;
    }
    return 0;
  };

  const getHours = (hours: number | undefined, selectedHourFormat: string) => {
    if (hours === undefined) {
      return undefined;
    }
    if (selectedHourFormat === 'PM' && hours === 12) {
      return 0;
    }
    if (selectedHourFormat === 'AM' && hours === 0) {
      return 12;
    }
    if (selectedHourFormat === 'AM' && hours > 12) {
      return hours - 12;
    }
    if (selectedHourFormat === 'PM' && hours > 12) {
      return hours;
    }
    return selectedHourFormat === 'AM' ? hours : hours + 12;
  };

  const selectDate = ({ year, month, day, hours, minutes, selectedHourFormat }: SelectDate) => {
    const selectedYear = year ?? selectedDate.getFullYear();
    const selectedMonth = month ?? selectedDate.getMonth();
    const selectedDay = day ?? selectedDate.getDate();
    const selectedHours = getHours(hours ?? selectedDate.getHours(), selectedHourFormat);
    const selectedMinutes = minutes ?? selectedDate.getMinutes();
    setSelectedDate(
      new Date(selectedYear, selectedMonth, selectedDay, selectedHours, selectedMinutes),
    );
  };

  useEffect(() => {
    setMonths(getMonthsForLocale('es-CR'));
  }, []);

  useEffect(() => {
    setDays(getDaysForLocale('es-CR'));
  }, []);

  useEffect(() => {
    const date = new Date();
    setSelectedDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 1, 0));
  }, []);

  useEffect(() => {
    onSelectDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    setFirstDayWeekday(getWeekdayForFirstDayOfMonth(selectedMonth, selectedYear));
    setLastDayWeekday(getWeekdayForLastDayOfMonth(selectedMonth, selectedYear));
  }, [selectedYear, selectedMonth]);

  return (
    <div className="w-full md:w-4/12 shadow-lg rounded-xl default-background-color">
      <div className="small-padding md:padding">
        <div className="grid grid-cols-3">
          <button
            type="button"
            className="justify-self-start"
            aria-label="Previous"
            onClick={goToPreviousMonth}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <span className="text-center">
            {months[selectedMonth ?? 0]}/{selectedYear}
          </span>

          <button
            type="button"
            className="justify-self-end"
            aria-label="Next"
            onClick={goToNextMonth}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-7 small-margin-top">
          {days.map((day) => {
            return (
              <span key={day} className="text-center text-sm">
                {day}
              </span>
            );
          })}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {!!firstDayWeekday &&
            range(1, firstDayWeekday, 1).map((x) => {
              const previousMonth = getPreviousMonth();
              const previousYear = getPreviousYear();
              const lastMonthDay =
                getAmountOfDaysForMonth(previousMonth, previousYear) - firstDayWeekday + x;
              return (
                <button
                  key={x}
                  type="button"
                  className="flex small-padding justify-center border border-transparent text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none"
                  disabled
                >
                  {lastMonthDay}
                </button>
              );
            })}
          {range(1, getAmountOfDaysForMonth(selectedMonth, selectedYear), 1).map((x) => {
            return (
              <button
                key={x}
                type="button"
                className={classNames(
                  'flex small-padding justify-center border-2 border-transparent text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none',
                  {
                    'primary-button-colors': isSelectedDateEqual(selectedYear, selectedMonth, x),
                  },
                  {
                    'hover:border-blue-800': !isSelectedDateEqual(selectedYear, selectedMonth, x),
                  },
                )}
                disabled={isDateBefore(new Date(selectedYear, selectedMonth, x), new Date())}
                onClick={() =>
                  selectDate({
                    year: selectedYear,
                    month: selectedMonth,
                    day: x,
                    selectedHourFormat,
                  })
                }
              >
                {x}
              </button>
            );
          })}
          {lastDayWeekday !== null &&
            range(lastDayWeekday, 6 + includeNextWeekOfNextMonth(), 1, false).map((x, index) => {
              return (
                <button
                  key={x}
                  type="button"
                  className="flex small-padding justify-center border border-transparent text-sm rounded-full disabled:opacity-50 disabled:pointer-events-none"
                  disabled
                >
                  {index + 1}
                </button>
              );
            })}
        </div>
        <div className="flex justify-center items-center small-gap small-margin-top">
          <div className="relative">
            <select
              className="w-12 appearance-none border rounded-md text-sm text-gray-900"
              onChange={(x) =>
                selectDate({ hours: Number.parseInt(x.target.value), selectedHourFormat })
              }
            >
              {range(1, 12, 1).map((x) => {
                return (
                  <option key={x} className="text-sm">
                    {formatMinimumIntegerDigits(x)}
                  </option>
                );
              })}
            </select>

            <div className="absolute top-1/2 end-2 -translate-y-1/2">
              <svg
                className="shrink-0 size-3 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m7 15 5 5 5-5" />
                <path d="m7 9 5-5 5 5" />
              </svg>
            </div>
          </div>
          <span>:</span>

          <div className="relative">
            <select
              className="w-12 appearance-none border rounded-md text-sm text-gray-900"
              onChange={(x) =>
                selectDate({ minutes: Number.parseInt(x.target.value), selectedHourFormat })
              }
            >
              {range(0, 59, 1).map((x) => {
                return (
                  <option key={x} className="text-sm">
                    {formatMinimumIntegerDigits(x)}
                  </option>
                );
              })}
            </select>

            <div className="absolute top-1/2 end-2 -translate-y-1/2">
              <svg
                className="shrink-0 size-3 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m7 15 5 5 5-5" />
                <path d="m7 9 5-5 5 5" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <select
              className="w-16 appearance-none border rounded-md text-sm text-gray-900"
              onChange={(x) => {
                selectDate({ selectedHourFormat: x.target.value });
                setSelectedHourFormat(x.target.value);
              }}
            >
              <option>AM</option>
              <option>PM</option>
            </select>

            <div className="absolute top-1/2 end-2 -translate-y-1/2">
              <svg
                className="shrink-0 size-3 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m7 15 5 5 5-5" />
                <path d="m7 9 5-5 5 5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
