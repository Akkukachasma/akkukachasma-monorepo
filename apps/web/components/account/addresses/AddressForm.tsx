"use client";

import { Button, ProcessIndicator } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addressSchema } from "@/lib/validations/account.validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import statesData from "@/states.json";
import useCreateAddress, {
  CreateAddressPayload,
} from "@/lib/mutations/account/useCreateAddress";
import useUpdateAddress, {
  UpdateAddressPayload,
} from "@/lib/mutations/account/useUpdateAddress";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { isPincodeServiceabilityUnavailable } from "@/lib/api";
import useValidatePincode, {
  normalizePincode,
} from "@/lib/queries/account/useValidatePincode";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setAddressModal } from "@/store/account.slice";

type AddressFormValues = z.infer<typeof addressSchema>;
const stateOptions = Object.keys(statesData as Record<string, string[]>);

const LABEL_OPTIONS = [
  { value: "home" as const, title: "Home", hint: "Most deliveries" },
  { value: "work" as const, title: "Work", hint: "Office hours" },
  { value: "other" as const, title: "Other", hint: "Family & friends" },
];

const matchOption = (options: string[], value: string) =>
  options.find((option) => option.toLowerCase() === value.toLowerCase()) ??
  value;

const AddressForm = () => {
  const dispatch = useAppDispatch();
  const editingAddress = useAppSelector(
    (store) => store.accountStore.editingAddress,
  );
  const isEditing = Boolean(editingAddress);
  const skipNextAutofill = useRef(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: editingAddress?.label ?? "home",
      country: "India",
      address: editingAddress?.address ?? "",
      city: editingAddress?.city ?? "",
      state: editingAddress?.state ?? "",
      zip_code: editingAddress?.zip_code ?? "",
      notes: editingAddress?.notes ?? "",
    },
    mode: "onBlur",
  });
  const { watch, setValue, clearErrors, reset } = form;
  const zipCode = watch("zip_code");
  const selectedState = watch("state");
  const selectedCity = watch("city");
  const normalizedZip = normalizePincode(zipCode);
  const {
    data: pincodeData,
    isFetching: lookingUpPin,
    isError: pinLookupFailed,
    isSuccess: pinLookupSucceeded,
  } = useValidatePincode(normalizedZip);
  const { mutateAsync: createAddress, isPending: creating } = useCreateAddress();
  const { mutateAsync: updateAddress, isPending: updating } = useUpdateAddress();
  const isPending = creating || updating;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] =
    useState<AddressFormValues | null>(null);
  const [locationAutofilled, setLocationAutofilled] = useState(
    Boolean(editingAddress?.city && editingAddress?.state),
  );

  useEffect(() => {
    if (!editingAddress) return;
    skipNextAutofill.current = true;
    reset({
      label: editingAddress.label,
      country: "India",
      address: editingAddress.address,
      city: editingAddress.city,
      state: editingAddress.state,
      zip_code: editingAddress.zip_code,
      notes: editingAddress.notes ?? "",
    });
    setLocationAutofilled(true);
  }, [editingAddress, reset]);

  // Clear stale location when pin is incomplete or changed
  useEffect(() => {
    if (normalizedZip.length === 6) return;
    if (!selectedCity && !selectedState) return;
    setValue("city", "");
    setValue("state", "");
    setLocationAutofilled(false);
  }, [normalizedZip, selectedCity, selectedState, setValue]);

  useEffect(() => {
    if (!pincodeData?.isValid || normalizedZip.length !== 6) return;
    if (normalizePincode(pincodeData.pincode) !== normalizedZip) return;

    // Keep existing city/state on first load of edit form
    if (skipNextAutofill.current) {
      skipNextAutofill.current = false;
      return;
    }

    const apiCity = (pincodeData.city || pincodeData.district || "").trim();
    const apiState = (pincodeData.state || "").trim();
    if (!apiCity && !apiState) return;

    const nextState = apiState ? matchOption(stateOptions, apiState) : "";
    const nextCity = apiCity;

    if (nextState) {
      setValue("state", nextState, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      clearErrors("state");
    }
    if (nextCity) {
      setValue("city", nextCity, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      clearErrors("city");
    }
    setLocationAutofilled(Boolean(nextCity || nextState));
  }, [pincodeData, normalizedZip, setValue, clearErrors]);

  const mergedStateOptions =
    selectedState && !stateOptions.includes(selectedState)
      ? [...stateOptions, selectedState]
      : stateOptions;

  const pinComplete = normalizedZip.length === 6;
  const showPinSuccess =
    pinComplete &&
    (locationAutofilled || pinLookupSucceeded) &&
    !lookingUpPin &&
    !pinLookupFailed;
  const showPinError =
    pinComplete && pinLookupFailed && !lookingUpPin && !locationAutofilled;

  const saveAddress = async (
    data: AddressFormValues,
    acknowledgeUnverified = false,
  ) => {
    const base = { ...data, country: "India" as const };
    if (isEditing && editingAddress) {
      const payload: UpdateAddressPayload = {
        ...base,
        id: editingAddress.id,
        ...(acknowledgeUnverified && {
          acknowledge_unverified_pincode: true,
        }),
      };
      await updateAddress(payload);
    } else {
      const payload: CreateAddressPayload = {
        ...base,
        ...(acknowledgeUnverified && {
          acknowledge_unverified_pincode: true,
        }),
      };
      await createAddress(payload);
    }
    dispatch(setAddressModal(false));
    form.reset();
  };

  const onSubmit = async (data: AddressFormValues) => {
    try {
      await saveAddress(data);
    } catch (err) {
      if (isPincodeServiceabilityUnavailable(err)) {
        setPendingPayload(data);
        setConfirmOpen(true);
      }
    }
  };

  const onConfirmUnverified = async () => {
    if (!pendingPayload) return;
    setConfirmOpen(false);
    const data = pendingPayload;
    setPendingPayload(null);
    try {
      await saveAddress(data, true);
    } catch {
      // onError toast handles non-unavailable failures
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            "space-y-7",
            isPending && "pointer-events-none opacity-60",
          )}
        >
          <p className="text-sm text-muted-foreground">
            Enter your pin code first — we&apos;ll fill city and state for you.
          </p>

          {/* Location */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="size-4 text-emerald-600" aria-hidden />
              Delivery location
            </div>

            <FormField
              control={form.control}
              name="zip_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pin code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="e.g. 110001"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        maxLength={6}
                        className="h-11 pr-10 text-base tracking-wide"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          setLocationAutofilled(false);
                          field.onChange(normalizePincode(e.target.value));
                        }}
                      />
                      {lookingUpPin && (
                        <Loader2
                          className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                          aria-label="Looking up pin code"
                        />
                      )}
                      {showPinSuccess && (
                        <CheckCircle2
                          className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-emerald-600"
                          aria-hidden
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    {lookingUpPin
                      ? "Finding city and state…"
                      : showPinSuccess
                        ? `Found ${selectedCity}${selectedState ? `, ${selectedState}` : ""}`
                        : showPinError
                          ? "We couldn’t verify this pin. Please enter city and state below."
                          : "6-digit Indian pin code"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City / district</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          lookingUpPin ? "Looking up…" : "e.g. New Delhi"
                        }
                        autoComplete="address-level2"
                        className="h-11"
                        disabled={lookingUpPin}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          setLocationAutofilled(false);
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      key={`state-${field.value || "empty"}`}
                      disabled={lookingUpPin}
                      onValueChange={(value) => {
                        setLocationAutofilled(false);
                        field.onChange(value);
                      }}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mergedStateOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Country: <span className="font-medium text-foreground">India</span>
            </p>
          </section>

          {/* Street details */}
          <section className="space-y-4">
            <div className="text-sm font-medium text-foreground">
              Address details
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="House / flat no., building, street, area"
                      className="min-h-[88px] resize-y"
                      autoComplete="street-address"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include a nearby landmark if the address is hard to find.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Delivery note{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Ring the bell, leave with security"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Label */}
          <section className="space-y-3">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Save as</FormLabel>
                  <FormControl>
                    <div
                      className="grid grid-cols-3 gap-2"
                      role="radiogroup"
                      aria-label="Address label"
                    >
                      {LABEL_OPTIONS.map((option) => {
                        const selected = field.value === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => field.onChange(option.value)}
                            className={cn(
                              "rounded-xl border px-3 py-2.5 text-left transition-colors touch-manipulation",
                              selected
                                ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                                : "border-border bg-background hover:bg-muted/50",
                            )}
                          >
                            <span className="block text-sm font-medium">
                              {option.title}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-muted-foreground">
                              {option.hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <Button
            type="submit"
            disabled={isPending || lookingUpPin}
            className="h-11 w-full touch-manipulation rounded-xl bg-emerald-600 hover:bg-emerald-700 sm:w-auto sm:min-w-[180px]"
          >
            <ProcessIndicator
              btnText={isEditing ? "Update address" : "Save address"}
              isProcessing={isPending}
            />
          </Button>
        </form>
      </Form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Can&apos;t verify delivery right now
            </AlertDialogTitle>
            <AlertDialogDescription>
              We temporarily can&apos;t confirm delivery for this pin code. You
              can still save the address and continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingPayload(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmUnverified}>
              Save anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddressForm;
