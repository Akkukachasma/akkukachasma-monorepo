import React from "react";
import { IconInterface } from "@/lib/types";

const ShapeIcon: React.FC<IconInterface> = (props) => {
  return (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"{...props}><path fill="none" strokeLinejoin="round" strokeWidth="32" d="M336 320H32L184 48l152 272zm-70.68-125.49A144 144 0 1 1 192 320"></path></svg>
  );
};

export default ShapeIcon;
