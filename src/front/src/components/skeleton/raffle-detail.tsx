import { range } from '@/utils';

export default function RaffleCard() {
  return (
    <>
      <div className="skeleton-animation width margin-bottom h-12" />
      <div className="secondary-background-color rounded-2xl shadow-lg padding margin-bottom grid md:grid-cols-3 md:grid-rows-6 md:gap-x-8 gap-2 width">
        <div className="skeleton-animation md:col-span-2 md:row-span-3 w-full h-full" />
        <div className="skeleton-animation md:col-start-3 w-full h-6" />
        <div className="skeleton-animation md:col-start-3 w-full h-6" />
        <div className="skeleton-animation md:col-start-3 w-full h-6" />
        <div className="skeleton-animation md:col-start-3 w-full h-6" />
        <div className="skeleton-animation md:col-start-3 w-full h-6" />
        <div className="skeleton-animation md:col-start-3 w-full h-6" />
        <div className="skeleton-animation md:col-start-3 w-full h-6" />
        <div className="skeleton-animation md:col-start-3 w-full h-6" />
        <div className="skeleton-animation md:col-start-3 w-full h-6" />
        <div className="skeleton-animation md:col-start-3 w-full h-6" />
      </div>
      <div className="skeleton-animation margin-bottom width h-12" />
      <div className="width padding rounded-2xl flex justify-center shadow-lg secondary-background-color">
        <div className="grid grid-cols-10 grid-rows-10 w-full md:w-fit place-items-center relative">
          {range(0, 99, 1).map((x) => {
            return <div key={x} className="w-10 h-10 skeleton-animation border border-solid" />;
          })}
        </div>
      </div>
    </>
  );
}
