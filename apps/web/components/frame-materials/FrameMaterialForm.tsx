"use client";
import { Button, ProcessIndicator } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";

import { frameMaterialSchema } from "@/lib/validations/admin/frame-materials.validation";
import useUpdateFrameMaterials from "@/lib/mutations/admin/frame-materials/useUpdateFrameMaterials";
import useCreateFrameMaterials from "@/lib/mutations/admin/frame-materials/useCreateFrameMaterials";
import { resetStore, showModal } from "@/store/frame-materials/form.slice";


const FrameMaterialForm: React.FC = () => {
  const form = useForm<z.infer<typeof frameMaterialSchema>>({
    defaultValues: { title: "",description:"" },
    mode: "onBlur",
    resolver: zodResolver(frameMaterialSchema),
  });

  const dispatch = useAppDispatch();

  const { data, frame_material_id } = useAppSelector(
    (store) => store.frameMaterialStore.formStore,
  );

  const { mutate: updateFrameMaterials, isPending: updating } =
  useUpdateFrameMaterials();

  const { mutate: createFrameMaterials, isPending: creating } =
  useCreateFrameMaterials();

  const isPending = updating || creating;  

  const onSubmit = (data: z.infer<typeof frameMaterialSchema>) => {
    if (frame_material_id) {
      updateFrameMaterials(data);
    } else {
      createFrameMaterials(data);
    }
  };

  React.useEffect(() => {
    if (data) {
      form.reset({
        title: data?.title,
        description:data?.description
      });
    }
  }, [data, form]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-4">
        
          

          

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
           name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() =>
              dispatch(frame_material_id ? resetStore() : showModal(false))
            }
            variant="secondary"
          >
            {frame_material_id ? "Discard" : "Cancel"}
          </Button>
          <Button type="submit">
            <ProcessIndicator
              isProcessing={isPending}
              btnText={frame_material_id ? "Save" : "Create"}
            />
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default FrameMaterialForm;
