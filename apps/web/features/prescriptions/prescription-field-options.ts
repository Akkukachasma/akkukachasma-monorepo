import type { InputOption } from "@/lib/types";

export const sph_options: InputOption[] = Array.from({ length: 81 }, (_, i) => {
  const value = (-14 + i * 0.25).toFixed(2);
  const formatted = value.startsWith("-")
    ? value
    : value === "0.00"
      ? `${value}`
      : `+${value}`;
  return {
    value: formatted,
    label: value === "0.00" ? `${formatted} (Plain)` : formatted,
  };
});

export const cyl_options: InputOption[] = Array.from({ length: 41 }, (_, i) => {
  const value = (-6 + i * 0.25).toFixed(2);
  const formatted = value.startsWith("-")
    ? value
    : value === "0.00"
      ? `${value}`
      : `+${value}`;
  return {
    value: formatted,
    label: value === "0.00" ? `${formatted} (Plain)` : formatted,
  };
});

export const axis_options: InputOption[] = Array.from({ length: 181 }, (_, i) => {
  const value = i.toString();
  return { value, label: `${value}°` };
});

export const add_options: InputOption[] = [
  { value: "none", label: "None" },
  ...Array.from({ length: 9 }, (_, i) => {
    const value = (1 + i * 0.25).toFixed(2);
    const formatted = value.startsWith("-") ? value : `+${value}`;
    return { value: formatted, label: formatted };
  }),
];

export const defaultFillupValues = {
  type: "fillup" as const,
  right_sph: "0.00",
  right_cyl: "0.00",
  right_axis: "0",
  right_add: "none",
  left_sph: "0.00",
  left_cyl: "0.00",
  left_axis: "0",
  left_add: "none",
  comments: "",
};
