import useFetch from "@/lib/hooks/use-fetch";
import { DialogTitle } from "../dialog";
import Modal, { ModalProps } from "../modal";
import MultiSelect from "../multi-select";
import { IColor } from "@/components/colors/ListItem";
import ENDPOINTS from "@/lib/endpoints";
import React from "react";
import {
  ColorOptionTemplate,
  ColorPreviewTemplate,
} from "@/components/products/ItemForm";
import { Button } from "../button";
import { ColorGroupItem } from ".";
interface ColorInputModalProps extends Omit<ModalProps, "children"> {
  onChange: (val: ColorGroupItem[]) => void;
}
const ColorInputModal: React.FC<ColorInputModalProps> = ({
  onChange,
  open,
  onOpenChange,
}) => {
  const [colors, setColors] = React.useState<ColorGroupItem[]>([]);

  const { data: colorData, isLoading: colorDataLoading } = useFetch<IColor[]>({
    endpoint: ENDPOINTS.admin.colors.fetch_all(),
  });

  const handleAdd = () => {
    if (colors.length) {
      onChange?.(colors);
      setColors([]);
      onOpenChange(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <DialogTitle>Select Colors</DialogTitle>
      <MultiSelect
        id="color_ids"
        options={
          colorDataLoading
            ? []
            : (colorData?.map((color) => ({
                label: color?.name ?? "Unknown",
                value: color?.id ?? "",
                data: color,
              })) ?? [])
        }
        value={colors?.map((c) => c.id)}
        onChange={(colors) => {
          const colorsWithColorCodes =
            colors?.map((c) => {
              return {
                id: c,
                color: colorData.find((cd) => cd.id === c)?.color || "",
              };
            }) || [];
          setColors(colorsWithColorCodes);
        }}
        optionTemplate={ColorOptionTemplate}
        previewTemplate={ColorPreviewTemplate}
      />
      <Button className="mt-3" type="button" onClick={handleAdd}>
        Add
      </Button>
    </Modal>
  );
};
export default ColorInputModal;
