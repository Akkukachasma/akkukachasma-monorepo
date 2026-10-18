"use client";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Modal from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store";
import React from "react";

import LensFeatureForm from "./LensFeatureForm";
import { resetStore, setLensFeatureId } from "@/store/lens-features/form.slice";
import useSessionStorage from "@/hooks/use-session-storage";
import { IFile } from "@/lib/types";

const EditLensFeatureModal: React.FC = () => {
  const { removeValue: removeUploadedImageFromSession } =
    useSessionStorage<IFile>("lens_feature_image");
  const dispatch = useAppDispatch();
  const lens_feature_id = useAppSelector(
    (store) => store.lensFeatureStore.formStore.lens_feature_id,
  );

  const handleClose = (val: boolean) => {
    if (!val) {
      dispatch(resetStore());
      removeUploadedImageFromSession();
    }
    dispatch(setLensFeatureId(val ? lens_feature_id : ""));
  };

  return (
    <Modal
      open={Boolean(lens_feature_id)}
      onOpenChange={(val) => handleClose(val)}
      showCloseIcon
    >
      <DialogHeader>
        <DialogTitle>Update Lens Feature</DialogTitle>
        <DialogDescription>
          Make changes to lens feature here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <LensFeatureForm />
    </Modal>
  );
};
export default EditLensFeatureModal;
