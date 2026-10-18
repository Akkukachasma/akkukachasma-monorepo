import { IconInterface } from "@/lib/types";
import React from "react";

const ActionIcon: React.FC<IconInterface> = (props) => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 20 20"
      aria-hidden="true"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
    </svg>
  );
};

export default ActionIcon;
