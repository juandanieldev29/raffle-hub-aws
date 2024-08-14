import { range } from '@/utils';

export default function RaffleCard() {
  return (
    <div className="mt-8">
      <div className="skeleton-line w-[95%] md:w-11/12 mx-auto mb-8 h-12" />
      <div className="skeleton rounded-2xl shadow-lg p-4 mb-4 grid md:grid-cols-3 md:grid-rows-6 md:gap-x-8 gap-2 w-11/12 mx-auto">
        <div className="skeleton-line bg-[length:200%_100%] md:col-span-2 md:row-span-3 w-full h-full" />
        <div className="skeleton-line md:col-start-3 w-full h-6" />
        <div className="skeleton-line md:col-start-3 w-full h-6" />
        <div className="skeleton-line md:col-start-3 w-full h-6" />
        <div className="skeleton-line md:col-start-3 w-full h-6" />
        <div className="skeleton-line md:col-start-3 w-full h-6" />
        <div className="skeleton-line md:col-start-3 w-full h-6" />
        <div className="skeleton-line md:col-start-3 w-full h-6" />
        <div className="skeleton-line md:col-start-3 w-full h-6" />
        <div className="skeleton-line md:col-start-3 w-full h-6" />
        <div className="skeleton-line md:col-start-3 w-full h-6" />
      </div>
      <div className="skeleton-line w-[95%] md:w-11/12 mx-auto mb-8 h-12" />
      <div className="w-[95%] md:w-11/12 mx-auto md:p-4 mb-4 rounded-2xl flex justify-center shadow-lg">
        <div className="grid grid-cols-10 grid-rows-10 w-full md:w-fit place-items-center relative">
          {range(0, 99, 1).map((x) => {
            return <div className="w-10 h-10 skeleton-line border border-solid"></div>;
          })}
        </div>
      </div>
    </div>
  );
}
