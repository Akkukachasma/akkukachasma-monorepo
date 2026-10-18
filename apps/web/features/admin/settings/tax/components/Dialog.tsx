"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import TaxForm from "./TaxForm";
import Modal from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store";
import { setDialog, resetStore } from "../store/ui.slice";
const TaxDialog = () => {
  const dispatch = useAppDispatch();
  const { dialog, data } = useAppSelector((store) => store.invoiceTaxStore.ui);

  const handleClose = (val: boolean) => {
    if (!val) {
      dispatch(resetStore());
    } else {
      dispatch(setDialog(val));
    }
  };

  return (
    <Modal open={dialog} onOpenChange={(val) => handleClose(val)}>
      <DialogHeader>
        <DialogTitle>{data ? "Update Tax" : "Create Tax"}</DialogTitle>
        <DialogDescription>
          {data ? "Update tax details" : "Create a new tax type"}
        </DialogDescription>
      </DialogHeader>

      <TaxForm />
    </Modal>
  );
};

export default TaxDialog;
