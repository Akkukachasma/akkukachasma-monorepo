import { Button, ProcessIndicator } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { Camera, ChevronLeft } from "lucide-react";
import { PurchaseStore } from "../types";
import React from "react";
import useSessionStorage from "@/hooks/use-session-storage";
import { HiPencil } from "react-icons/hi";
import PrescriptionForm from "./PrescriptionForm";
import PrescriptionImageForm from "./PrescriptionImageForm";
import { cn } from "@/lib/utils";
import { PurchaseStepProps } from "./SelectPowerType";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { purchaseSchema } from "../purchase.schema";

interface SetPrescriptionProps extends PurchaseStepProps {
  isPending?: boolean;
  onAddToCart: () => void;
  onCheckout: () => void;
}

const FILLUP_DEFAULTS = {
  right_sph: "0.00",
  left_sph: "0.00",
  right_cyl: "0.00",
  left_cyl: "0.00",
  right_axis: "0",
  left_axis: "0",
  right_add: "none",
  left_add: "none",
} as const;

const SetPrescription: React.FC<SetPrescriptionProps> = ({
  control,
  isPending,
  onAddToCart,
  onCheckout,
}) => {
  const { setValue } = useFormContext<z.infer<typeof purchaseSchema>>();
  const [pendingAction, setPendingAction] = React.useState<
    "cart" | "checkout" | null
  >(null);

  const { setValue: setPurchaseStore, value: purchaseStore } =
    useSessionStorage<PurchaseStore>("purchase_store");
  const [fillup, setFillup] = React.useState(false);
  const [photo, setPhoto] = React.useState(false);

  const handlePrescriptionChange = (type: "fillup" | "photo") => {
    const comments = purchaseStore?.data?.prescription?.comments || "";

    if (type === "fillup") {
      setValue("prescription", {
        type: "fillup",
        comments,
        ...FILLUP_DEFAULTS,
      });
      setFillup(true);
      setPhoto(false);
    } else {
      setValue("prescription", {
        type: "photo",
        image: purchaseStore?.data?.prescription?.type === "photo"
          ? (purchaseStore.data.prescription as { image?: string }).image || ""
          : "",
        comments,
      });
      setFillup(false);
      setPhoto(true);
    }

    setPurchaseStore(
      (prev) =>
        ({
          ...prev,
          data: {
            ...prev.data,
            prescription:
              type === "fillup"
                ? {
                    type: "fillup",
                    comments,
                    ...FILLUP_DEFAULTS,
                  }
                : {
                    type: "photo",
                    image: "",
                    comments,
                  },
          },
        }) as PurchaseStore,
    );
  };

  const handleAddToCart = () => {
    setPendingAction("cart");
    onAddToCart();
  };

  const handleCheckout = () => {
    setPendingAction("checkout");
    onCheckout();
  };

  React.useEffect(() => {
    if (!isPending) {
      setPendingAction(null);
    }
  }, [isPending]);

  return (
    <div className="flex flex-col gap-10">
      <DialogTitle className="items-center flex gap-2">
        <Button
          title="Back to power type selection"
          size="icon"
          variant="ghost"
          type="button"
          onClick={() =>
            setPurchaseStore((prev) => {
              return {
                ...prev,
                step: 3,
              } as PurchaseStore;
            })
          }
        >
          <ChevronLeft />
        </Button>
        <span>Set Prescription</span>
      </DialogTitle>

      <div className="w-full max-w-[550px] mx-auto flex flex-col gap-4">
        <div
          className={cn(
            "w-full h-20 rounded-lg flex items-center justify-between cursor-pointer border hover:border-primary animate-smooth px-4",
            purchaseStore?.data?.prescription?.type === "fillup" &&
              "border-2 border-primary",
          )}
          onClick={() => handlePrescriptionChange("fillup")}
        >
          <div className="flex flex-col items-start gap-1">
            <h3>Fill it online</h3>
            <p className="text-primary/60">
              Fill it manually according to your printed prescription
            </p>
          </div>
          <div>
            <HiPencil className="size-10 text-primary/60" />
          </div>
        </div>
        <PrescriptionForm
          control={control}
          open={fillup}
          onOpenChange={setFillup}
        />
        <span className="text-4xl text-primary/20 font-bold mx-auto">or</span>
        <div
          className={cn(
            "w-full h-20 rounded-lg flex items-center justify-between cursor-pointer border hover:border-primary animate-smooth px-4",
            purchaseStore?.data?.prescription?.type === "photo" &&
              "border-2 border-primary",
          )}
          onClick={() => handlePrescriptionChange("photo")}
        >
          <span className="flex flex-col items-start gap-1">
            <strong>Upload the image</strong>
            <span className="text-primary/60">
              Upload the photo of your prescription
            </span>
          </span>
          <span>
            <Camera className="size-10 text-primary/60" />
          </span>
        </div>
        <PrescriptionImageForm
          control={control}
          open={photo}
          onOpenChange={setPhoto}
        />
      </div>
      <div className="flex flex-col items-stretch gap-2 justify-center mt-4 px-2 sm:flex-row sm:items-center sm:px-0">
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          className="h-11 w-full sm:h-10 sm:w-auto"
          onClick={handleAddToCart}
        >
          <ProcessIndicator
            btnText="Add To Cart"
            isProcessing={isPending && pendingAction === "cart"}
          />
        </Button>
        <Button
          type="button"
          disabled={isPending}
          className="h-11 w-full sm:h-10 sm:w-auto"
          onClick={handleCheckout}
        >
          <ProcessIndicator
            btnText="Ready To Checkout"
            isProcessing={isPending && pendingAction === "checkout"}
          />
        </Button>
      </div>
    </div>
  );
};
export default SetPrescription;
