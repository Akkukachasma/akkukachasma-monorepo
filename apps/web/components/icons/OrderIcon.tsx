import React from "react";
import { IconInterface } from "@/lib/types";

const OrderIcon: React.FC<IconInterface> = (props) => {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke-linecap="round"
      stroke-linejoin="round"
      height="1.8em"
      width="1.8em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.5 21h-2.926a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304h11.339a2 2 0 0 1 1.977 2.304l-.5 3.248"></path>
      <path d="M9 11v-5a3 3 0 0 1 6 0v5"></path>
      <path d="M15 19l2 2l4 -4"></path>
    </svg>
  );
};

export default OrderIcon;
