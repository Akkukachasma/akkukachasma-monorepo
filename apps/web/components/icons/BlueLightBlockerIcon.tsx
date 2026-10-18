import { IconInterface } from "@/lib/types";
import * as React from "react";

const BlueLightBlockerIcon: React.FC<IconInterface> = (props) => {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M16.8 11.2c.8-.9 1.2-2 1.2-3.2a6 6 0 0 0-9.3-5"></path>
      <path d="m2 2 20 20"></path>
      <path d="M6.3 6.3a4.67 4.67 0 0 0 1.2 5.2c.7.7 1.3 1.5 1.5 2.5"></path>
      <path d="M9 18h6"></path>
      <path d="M10 22h4"></path>
    </svg>
  );
};

export default BlueLightBlockerIcon;
