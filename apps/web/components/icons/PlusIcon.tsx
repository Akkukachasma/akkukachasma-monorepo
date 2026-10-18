import { IconInterface } from "@/lib/types";
import React from "react";
const PlusIcon: React.FC<IconInterface> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.6em"
      height="1.6em"
      viewBox="0 0 20 20"
      {...props}
    >
      <g id="add-btn" transform="translate(0.75 0.75)">
        <g
          id="Group_2434"
          data-name="Group 2434"
          transform="translate(9.244 -4.894) rotate(45)"
        >
          <path
            id="Stroke_1"
            data-name="Stroke 1"
            d="M0,5.542a.748.748,0,0,1-.53-.22.75.75,0,0,1,0-1.061L4.262-.53a.75.75,0,0,1,1.061,0,.75.75,0,0,1,0,1.061L.53,5.322A.748.748,0,0,1,0,5.542Z"
            transform="translate(7.604 7.595)"
            fill="currentColor"
          />
          <g id="Group_2433" data-name="Group 2433">
            <path
              id="Stroke_2"
              data-name="Stroke 2"
              d="M4.8,5.547a.748.748,0,0,1-.53-.22L-.53.53A.75.75,0,0,1-.53-.53.75.75,0,0,1,.53-.53l4.8,4.8a.75.75,0,0,1-.53,1.28Z"
              transform="translate(7.6 7.593)"
              fill="currentColor"
            />
          </g>
        </g>
        <path
          id="Stroke_3"
          data-name="Stroke 3"
          d="M13.584,0H4.915C1.894,0,0,2.139,0,5.166v8.168C0,16.361,1.885,18.5,4.915,18.5h8.668c3.031,0,4.917-2.139,4.917-5.166V5.166C18.5,2.139,16.614,0,13.584,0Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
};

export default PlusIcon;
