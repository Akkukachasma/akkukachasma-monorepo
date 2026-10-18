"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2, FileImage, Glasses } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { IPrescription } from "@/lib/types/prescription";
import useDeletePrescription from "@/lib/mutations/account/useDeletePrescription";
import PrescriptionEditDialog from "./PrescriptionEditDialog";

type PrescriptionsListProps = {
  items: IPrescription[];
};

function formatUpdated(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

const PrescriptionsList: React.FC<PrescriptionsListProps> = ({ items }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<IPrescription | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeletePrescription();

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {items.map((rx) => (
          <div
            key={rx.id}
            className="portal-surface flex flex-col overflow-hidden p-4 text-card-foreground"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                    rx.type === "photo"
                      ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  {rx.type === "photo" ? (
                    <FileImage className="size-4" />
                  ) : (
                    <Glasses className="size-4" />
                  )}
                </span>
                <Badge
                  variant="secondary"
                  className={`capitalize ${
                    rx.type === "photo"
                      ? "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                  }`}
                >
                  {rx.type === "fillup" ? "Manual" : "Photo"}
                </Badge>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 touch-manipulation sm:size-9"
                  aria-label="Edit prescription"
                  onClick={() => {
                    setEditing(rx);
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 touch-manipulation text-destructive hover:text-destructive sm:size-9"
                  aria-label="Delete prescription"
                  onClick={() => setDeleteId(rx.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            {rx.type === "fillup" ? (
              <p className="text-sm text-muted-foreground">
                OD SPH {rx.right_sph ?? "—"} · OS SPH {rx.left_sph ?? "—"}
              </p>
            ) : rx.image?.url ? (
              <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-md bg-muted">
                <Image
                  src={rx.image.url}
                  alt="Prescription"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Photo on file</p>
            )}

            {rx.comments ? (
              <p className="mt-2 line-clamp-2 text-sm">{rx.comments}</p>
            ) : null}

            <p className="mt-auto pt-3 text-xs text-muted-foreground">
              Updated {formatUpdated(rx.updated_at)}
            </p>
          </div>
        ))}
      </div>

      <PrescriptionEditDialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditing(null);
        }}
        mode="edit"
        initial={editing}
      />

      <AlertDialog
        open={Boolean(deleteId)}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete prescription?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Saved cart items are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate(deleteId, {
                    onSettled: () => setDeleteId(null),
                  });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PrescriptionsList;
