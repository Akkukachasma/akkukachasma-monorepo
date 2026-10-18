"use client";
import React from "react";
import { OptionTemplateProps } from ".";

const DefaultOptionTemplate = React.forwardRef<
  HTMLDivElement,
  OptionTemplateProps
>(({ label, value, onSelect }, ref) => {
  return (
    <div
      ref={ref}
      onClick={() => onSelect()}
      className="flex items-center p-2 animate-smooth rounded hover:bg-primary hover:text-primary-foreground cursor-pointer"
    >
      <span className="mr-2">{label}</span>
    </div>
  );
});

DefaultOptionTemplate.displayName = "DefaultOptionTemplate";

export default DefaultOptionTemplate;
