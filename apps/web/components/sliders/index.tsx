import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const Slider = () => {
  return (
    <Swiper>
      <SwiperSlide>Slide 1</SwiperSlide>
      <SwiperSlide>Slide 2</SwiperSlide>
      <SwiperSlide>Slide 3</SwiperSlide>
    </Swiper>
  );
};
export default Slider;
