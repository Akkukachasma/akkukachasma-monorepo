import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Modal, { ModalProps } from "@/components/ui/modal";
import { useFormContext } from "react-hook-form";
import { PurchaseStepProps } from "./SelectPowerType";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useSessionStorage from "@/hooks/use-session-storage";
import { PurchaseStore } from "../types";
import { IFile } from "@/lib/types";
import FileInput from "@/components/ui/file-input";
import FilePreview from "@/components/ui/file-input/FilePreview";
import DragDropIcon from "@/components/icons/DragDropIcon";
import useUpload from "@/lib/mutations/useUpload";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { purchaseSchema } from "../purchase.schema";
interface PrescriptionFormProps extends Omit<ModalProps, "children"> {
  control: PurchaseStepProps["control"];
}

const PrescriptionImageForm: React.FC<PrescriptionFormProps> = ({
  open,
  onOpenChange,
  control,
}) => {
  const { setValue } = useFormContext<z.infer<typeof purchaseSchema>>();
  const { value: purchaseStore, setValue: setPurchaseStore } =
    useSessionStorage<PurchaseStore>("purchase_store");
  const { value: uploadedImage, setValue: setUploadedImage } =
    useSessionStorage<IFile>("prescription_image");

  const { mutate: upload, isPending: uploading } = useUpload();

  const handleDiscardClick = () => {
    if (purchaseStore) {
      const newPurchaseStoreData = purchaseStore.data;
      delete newPurchaseStoreData?.prescription;
      setPurchaseStore({
        step: purchaseStore?.step,
        data: newPurchaseStoreData,
      });
      onOpenChange(false);
    }
  };

  const handleFieldChange = (name: string, val: string) => {
    setPurchaseStore(
      (prev) =>
        ({
          ...prev,
          data: {
            ...prev.data,
            prescription: {
              ...(prev?.data?.prescription && prev?.data?.prescription),
              [name]: val,
            },
          },
        }) as PurchaseStore,
    );
  };

  const handleSaveClick = () => {
    onOpenChange(false);
    if (uploadedImage?.id) {
      setValue("prescription.image", uploadedImage?.id);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} className="max-w-[900px]">
      <h2 className="text-center mb-4 font-bold text-2xl">
        Fill the prescription details
      </h2>

      <div className="flex flex-col gap-8 mb-4">
        <div className="flex flex-col md:flex-row items-start w-full gap-2">
          <label
            htmlFor="image"
            className="flex-shrink-0 w-full md:w-48 font-bold"
          >
            Prescription Photo
          </label>
          <FileInput
            id="image"
            onChange={(files) => {
              if (
                Array.isArray(files) &&
                !isNaN(files?.length) &&
                files?.length > 0
              ) {
                upload(
                  { files, name: "image" },
                  {
                    onSuccess: (data) => {
                      setUploadedImage({
                        id: data[0].id,
                        url: data[0].url,
                        fieldname: data[0].fieldname,
                        is_temp: data[0].is_temp,
                      });
                    },
                  },
                );
              }
            }}
            className="h-96"
          >
            <FilePreview
              file={null}
              {...(uploadedImage && {
                defaultValue: {
                  type: "image",
                  url: uploadedImage?.url,
                },
              })}
              className="size-full grid place-content-center"
            >
              <DragDropIcon className="size-[65px]" />
            </FilePreview>
          </FileInput>
        </div>
        <div className="flex flex-col md:flex-row items-start w-full gap-2">
          <label
            htmlFor="comments"
            className="flex-shrink-0 w-full md:w-48 font-bold"
          >
            Additional Comments
          </label>
          <FormField
            name="prescription.comments"
            control={control}
            render={({ field }) => (
              <FormItem className="w-full md:flex-grow">
                <FormControl className="w-full">
                  <Textarea
                    id="comments"
                    placeholder="Write any additional details or comments"
                    className="!min-h-fit placeholder:text-muted-foreground/60 w-full"
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                      handleFieldChange("comments", event.target.value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center w-full gap-2">
          <label
            htmlFor="save_rescription"
            className="flex-shrink-0 w-full md:w-48 font-bold"
          >
            Save Prescription
          </label>
          <FormField
            name="save_prescription"
            control={control}
            render={({ field }) => (
              <FormItem className="flex items-center">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      setPurchaseStore(
                        (prev) =>
                          ({
                            ...prev,
                            data: {
                              ...prev.data,
                              save_prescription: checked,
                            },
                          }) as PurchaseStore,
                      );
                    }}
                    id="save_rescription"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          onClick={() => handleDiscardClick()}
          type="button"
          variant="ghost"
        >
          I want to fill the details manually
        </Button>
        <Button type="button" onClick={() => handleSaveClick()}>
          Save Prescription
        </Button>
      </DialogFooter>
    </Modal>
  );
};
export default PrescriptionImageForm;
