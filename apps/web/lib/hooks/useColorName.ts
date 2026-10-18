import React from "react";
import { IProductColor } from "../types";
import { IColor } from "@/components/colors/ListItem";

export const getColorName = (colors: Array<IColor>): string => {
  if (Array.isArray(colors) && colors.length > 0) {
    const value = colors?.map((c) => `${c.name}-${c.color}`).join("-and-");
    return value;
  }
  return "";
};

const useColorName = ({ colors }: { colors: Array<IColor> }): string => {
  const [colorName, setColorName] = React.useState<string>("");
  React.useEffect(() => {
    const value = getColorName(colors);
    if (value) setColorName(value);
  }, [colors]);
  return colorName;
};
export default useColorName;
