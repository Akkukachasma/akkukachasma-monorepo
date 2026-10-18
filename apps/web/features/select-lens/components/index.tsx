"use client";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import useQueryState from "@/hooks/use-query-state";
import React from "react";
import SelectPowerType from "./SelectPowerType";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import { purchaseSchema } from "../purchase.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import useSessionStorage from "@/hooks/use-session-storage";
import SelectLensDetail from "./SelectLensDetail";
import { useLoggedInUser } from "@/features/auth";
import SelectLensFeature from "./SelectLensFeature";
import SetPrescription from "./SetPrescription";
import { IProductColor } from "@/lib/types";
import useProductColor from "@/lib/hooks/useProductColor";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/hooks/use-toast";
import useAddProductToCart from "@/features/select-lens/mutations/useAddProductToCart";
import { PurchaseStore } from "../types";
import useCheckout from "../mutations/useCheckout";
import PurchaseStepIndicator from "./PurchaseStepIndicator";
import PurchaseProductSummary from "./PurchaseProductSummary";
import { IProduct } from "@/components/products/ListItem";

interface ProceedToPurchaseProps {
  product_colors: IProductColor[];
  product?: Pick<IProduct, "model_name" | "power_types">;
  isMobile?: boolean;
  /** Merged onto the “Select Lens” trigger (e.g. mobile sticky bar flex). */
  triggerClassName?: string;
}

const ProceedToPurchase: React.FC<ProceedToPurchaseProps> = ({
  product_colors,
  product,
  isMobile,
  triggerClassName,
}) => {
  const { data: user, isLoading: authLoading } = useLoggedInUser();
  const isGuest = !authLoading && !user;
  const {
    value: purchaseStore,
    setValue: setPurchaseStore,
    removeValue: removePurchaseStore,
  } = useSessionStorage<PurchaseStore>("purchase_store", {
    data: null,
    step: 1,
  });
  const { value: open, setValue: onOpenChange } =
    useQueryState<boolean>("purchase");
  const { value: colorName } = useQueryState<string>("color_name");
  const productColor = useProductColor({ product_colors, colorName });
  const form = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      power_type_id: "",
      product_color_id: "",
      frame_only: false,
      lens_detail_id: "",
      lens_feature_id: "",
      save_prescription: false,
    },
    mode: "onBlur",
  });
  const {
    formState: { errors },
  } = form;
  // console.log("see this", errors);

  // modal close handler
  const handleModalClose = (modalOpen: boolean) => {
    if (!modalOpen) {
      removePurchaseStore();
      submitActionRef.current = "cart"; // reset for next open
    }
    onOpenChange(modalOpen);
  };

  const { mutate: addToCart, isPending: addingToCart } = useAddProductToCart();
  const { mutate: checkout, isPending: isCheckingOut } = useCheckout();

  const isPending = addingToCart || isCheckingOut;

  // Ref captures intended action synchronously (avoids React state race with form submit)
  const submitActionRef = React.useRef<'cart' | 'checkout'>('cart');

  const onSubmit = (formData: z.infer<typeof purchaseSchema>) => {
    const action = submitActionRef.current;
    submitActionRef.current = "cart";
    if (action === "checkout") {
      // Use addToCart when guest or auth still loading — checkout() requires auth
      if (isGuest || authLoading) {
        addToCart({ ...formData, redirectTo: "checkout" });
      } else {
        checkout(formData);
      }
    } else {
      addToCart(formData);
    }
  };

  const submitPurchase = (action: "cart" | "checkout") => {
    submitActionRef.current = action;
    form.handleSubmit(onSubmit, () => {
      toast({
        title: "Incomplete details",
        description:
          "Please complete your prescription (fill online or upload a photo) and try again.",
        variant: "destructive",
      });
    })();
  };

  const onNext = () => {
    if (purchaseStore?.step) {
      if (purchaseStore?.step < 3) {
        setPurchaseStore({
          ...purchaseStore,
          step: purchaseStore.step + 1,
        });
      }
    }
  };

  const onBack = () => {
    if (purchaseStore?.step) {
      if (purchaseStore?.step > 1) {
        setPurchaseStore({
          ...purchaseStore,
          step: purchaseStore.step - 1,
        });
      }
    }
  };

  React.useEffect(() => {
    if (purchaseStore?.data) {
      form.reset({
        ...purchaseStore?.data,
        prescription: {
          type: purchaseStore?.data?.prescription?.type || "fillup",
          comments: purchaseStore?.data?.prescription?.comments || "",
          ...(purchaseStore?.data?.prescription?.type === "fillup" && {
            right_sph: purchaseStore?.data?.prescription?.right_sph || "0.00",
            left_sph: purchaseStore?.data?.prescription?.left_sph || "0.00",
            right_cyl: purchaseStore?.data?.prescription?.right_cyl || "0.00",
            left_cyl: purchaseStore?.data?.prescription?.left_cyl || "0.00",
            right_axis: purchaseStore?.data?.prescription?.right_axis || "0",
            left_axis: purchaseStore?.data?.prescription?.left_axis || "0",
            right_add: purchaseStore?.data?.prescription?.right_add || "none",
            left_add: purchaseStore?.data?.prescription?.left_add || "none",
          }),
        },
      });
    }
  }, [purchaseStore, form]);

  return (
    <React.Fragment>
      <Button
        onClick={() => {
            onOpenChange(true);
            setPurchaseStore(
              (prev) =>
                ({
                  ...prev,
                  data: {
                    ...prev?.data || {},
                    product_color_id: productColor?.id || "",
                  },
                }) as PurchaseStore,
            );
          }}
          size={triggerClassName ? "lg" : isMobile ? "sm" : "lg"}
          title="Buy frame + lens by configuring the lenses."
          className={cn(
            "px-6",
            isMobile && !triggerClassName && "!w-fit",
            triggerClassName,
          )}
        >
          Select Lens
        </Button>
      <Modal
        open={Boolean(open)}
        onOpenChange={(val) => handleModalClose(val)}
        fullScreen
        showCloseIcon
        className={cn("", isPending && "pointer-events-none")}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex size-full flex-col overflow-hidden"
          >
            <div className="flex flex-shrink-0 flex-col gap-1 sm:gap-3 border-b bg-background px-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <PurchaseProductSummary
                productColor={productColor}
                productModelName={product?.model_name}
                className="w-fit"
              />
              <PurchaseStepIndicator
                currentStep={purchaseStore?.step ?? 1}
                className="sm:flex-1 sm:justify-end"
              />
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-2 sm:p-4">
            {purchaseStore?.step === 1 && (
              <SelectPowerType
                control={form.control}
                onNext={onNext}
                onBack={onBack}
                productPowerTypes={product?.power_types}
              />
            )}
            {purchaseStore?.step === 2 && (
              <SelectLensFeature
                onNext={onNext}
                onBack={onBack}
                control={form.control}
              />
            )}
            {purchaseStore?.step === 3 && (
              <SelectLensDetail control={form.control} />
            )}

            {purchaseStore?.step === 4 && (
              <SetPrescription
                control={form.control}
                isPending={isPending}
                onAddToCart={() => submitPurchase("cart")}
                onCheckout={() => submitPurchase("checkout")}
              />
            )}
            </div>
          </form>
        </Form>
      </Modal>
    </React.Fragment>
  );
};
export default ProceedToPurchase;
