import React from "react";
import { MdLocationOn, MdLocalShipping, MdPayment } from "react-icons/md";
import {
  BsFillPhoneFill,
  BsWhatsapp,
  BsFillEnvelopePaperFill,
} from "react-icons/bs";
import { HiMail, HiOutlineClock } from "react-icons/hi";
import { RiCustomerService2Line } from "react-icons/ri";
import Image from "next/image";
import Logo from "@/components/navigation/Logo";

const Footer = () => {
  return (
    <footer className="mx-auto mt-8 overflow-hidden w-full">
      <div className="bg-gray-700">
        <div className="app-container py-4 md:py-2 flex gap-8 flex-wrap md:flex-nowrap items-center justify-between text-white">
          <span className="flex gap-3 items-center tracking-wide text-lg">
            <MdLocalShipping /> Free Shipping
          </span>
          <span className="flex gap-3 items-center tracking-wide text-lg">
            <HiOutlineClock /> 24x7 Service
          </span>
          <span className="flex gap-3 items-center tracking-wide text-lg">
            <RiCustomerService2Line /> Online Payment
          </span>
        </div>
      </div>

      <div className="bg-gray-900">
        <div className="app-container py-8 flex gap-6 flex-wrap items-center justify-evenly">
          <div className="text-white font-bold flex gap-4 items-center tracking-wide">
            <span className="text-5xl">
              <BsFillEnvelopePaperFill />
            </span>
            <div className="">
              <h2 className="font-normal">Sale Up To 20% Off For</h2>
              <h2 className="text-2xl">JOIN OUR NEWSLETTER</h2>
            </div>
          </div>
          <div className="flex items-center flex-wrap">
            <input
              type="text"
              placeholder="Enter Your Whatsapp Number"
              className="text-gray-600 h-10 w-[350px] px-6 items-center focus:outline-none focus:ring-0"
            />
            <button className="h-10 py-2 px-5 bg-gray-800 text-white tracking-wider font-semibold cursor-pointer">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-200">
        <div className="app-container grid grid-cols-5 gap-8 shadow-sm  items-start justify-around py-8">
          <div className="flex flex-col gap-3 col-span-3 lg:col-span-2">
            <Logo />
            <p className="flex">
              Order Eyeglass and Sunglass Round - Square Geomantic shape
              eyeglass online from a vast range of products, styles and buy a
              pair of branded shades online from the portel. Open your
              eyeglasses style and adopt the new way designer eyeglasses shop
              Online / Offline with Akku ka chasma and Buy Blue cut lens free
              with Eyeglass.
            </p>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <h1 className="font-bold text-lg tracking-wide mb-1">My Account</h1>
            <ul className="flex flex-col gap-2">
              <li>About Us</li>
              <li>Contact Us</li>
              <li>Refund Policy</li>
              <li>Help</li>
              <li>Cancellation</li>
              <li>Terms & Condition</li>
              <li>Returns & Exchanges</li>
              <li>Shipping & Delivery</li>
            </ul>
          </div>
          <div className="col-span-5 lg:col-span-2 flex flex-col items-start">
            <h1 className="font-bold text-lg tracking-wide mb-1">CONTACT US</h1>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 items-center">
                <span className="text-lg">
                  <MdLocationOn />
                </span>
                <p>1/A Sector Noida India-201301</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-lg">
                  <BsFillPhoneFill />
                </span>
                <p>Call Us +91 8188881661</p>
              </div>
              {/* <div className="flex gap-2 items-center">
                <span className="text-lg">
                  <HiMail />
                </span>
                <p>Email Us help@akkukachasma.com</p>
              </div> */}
              <div className="flex gap-2 items-center">
                <span className="text-lg">
                  <BsWhatsapp />
                </span>
                <p>Whatsapp Us +91 8188881661</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
