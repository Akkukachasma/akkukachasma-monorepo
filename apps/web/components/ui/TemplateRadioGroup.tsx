"use client";
import { ChangeEvent, FC, FormEvent, Fragment } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "./button";

export type TemplateRadioOption<T = any> = {
  value: string | number;
  label: string;
  icon?: string;
  data?: T;
};

export type TemplateProps<T = any> = {
  isLast: boolean;
  isChecked: boolean;
  data: TemplateRadioOption<T>;
  onClick: (event: any) => void;
};

type TemplateRadiosTypes = {
  value: any;
  name: string;
  onChange: (arg: ChangeEvent<HTMLInputElement> | any) => void;
  options: TemplateRadioOption[];
  template?: React.ForwardRefExoticComponent<
    TemplateProps & React.RefAttributes<HTMLElement>
  >;
  className?: string;
  templateRef?: (node: HTMLElement | null) => void;
};

const DefaultTemplate: FC<TemplateProps> = ({ onClick, isChecked, data }) => {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={(e) => onClick(e)}
      className={`gap-2 text-base flex justify-start p-0 bg-transparent hover:bg-transparent`}
    >
      <span
        className={twMerge(
          "grid smooth place-content-center size-5 border-2 rounded-full",
          isChecked && "border-primary",
        )}
      >
        <span
          className={twMerge(
            "block smooth size-3 bg-transparent rounded-full",
            isChecked && "bg-primary",
          )}
        />
      </span>
      <span
        className={twMerge(
          "smooth text-base font-normal",
          isChecked && "text-primary",
        )}
      >
        {data.label}
      </span>
    </Button>
  );
};

const TemplateRadioGroup: FC<TemplateRadiosTypes> = ({
  name,
  value,
  onChange,
  className,
  options = [],
  template = DefaultTemplate,
  templateRef,
}) => {
  const Template = template;

  const handleChange = (event: FormEvent<HTMLDivElement>) => {
    onChange((event.target as HTMLInputElement).value);
  };

  const handleInputClick = (event: any) => {
    const target = event.currentTarget;
    let inputElement: HTMLInputElement | null = target.nextSibling;
    inputElement?.click();
  };

  return (
    <div
      aria-labelledby="radios with templates"
      onChange={(event) => handleChange(event)}
      className={twMerge("", className || "")}
    >
      {options.map((item, index) => {
        return (
          <Fragment key={index}>
            <Template
              onClick={handleInputClick}
              isLast={index === options.length - 1}
              isChecked={value == item.value}
              data={item}
              ref={templateRef}
            />
            <input
              className="hidden"
              type="radio"
              value={item.value}
              name={name}
            />
          </Fragment>
        );
      })}
    </div>
  );
};

export default TemplateRadioGroup;
