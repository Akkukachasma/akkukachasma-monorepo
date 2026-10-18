"use client";
import { IProductStarter } from "@/lib/types";
import MultiCardSlider from "@/components/ui/swiper/MultiCardSlider";
import ProductStarter from "@/features/products/components/cards/Starter";

const EyeglassTrends: React.FC<{ data: IProductStarter[] }> = ({ data }) => {
  return (
    <div className="app-container w-full flex flex-col md:flex-row items-center gap-2 md:gap-4 lg:gap-6 xl:gap-8 md:h-[200px] py-2">
      <div className="flex flex-col font-bold text-5xl w-[20rem] text-center">
        <span>EYEGLASSES</span>
        <span className="font-semibold text-primary/80">TREND</span>
      </div>
      <MultiCardSlider
        className=" w-screen md:w-[calc(100%-20rem)]"
        swiperClass="h-[150px]"
        template={ProductStarter}
        pagination={false}
        breakpoints={{
          "@0.00": {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          "@0.25": {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          "@0.75": {
            slidesPerView: 4,
            spaceBetween: 10,
          },
          "@1.00": {
            slidesPerView: 5,
            spaceBetween: 20,
          },
          "@1.25": {
            slidesPerView: 6,
            spaceBetween: 25,
          },
          "@1.50": {
            slidesPerView: 6,
            spaceBetween: 30,
          },
        }}
        data={data}
      />
    </div>
  );
};
export default EyeglassTrends;
