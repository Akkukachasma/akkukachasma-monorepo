import { z } from "zod";
import {
  isWithinUploadLimit,
  uploadLimitExceededMessage,
} from "@/lib/upload-limits";

function assertFileSize(file: File, ctx: z.RefinementCtx) {
  if (!isWithinUploadLimit(file.size)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: uploadLimitExceededMessage(),
    });
  }
}

/** Single File that must be within the upload limit. */
export const zFile = z
  .custom<File>((val) => typeof File !== "undefined" && val instanceof File, {
    message: "File is required",
  })
  .superRefine((file, ctx) => assertFileSize(file, ctx));

/** One or more Files, each within the upload limit. */
export const zFiles = z
  .array(z.custom<File>((val) => typeof File !== "undefined" && val instanceof File))
  .superRefine((files, ctx) => {
    for (const file of files) {
      assertFileSize(file, ctx);
    }
  });

/**
 * Form fields that may be a File, File[], existing URL/id string, or other
 * preview value — only File instances are size-checked.
 */
export const optionalUploadField = z
  .any()
  .optional()
  .superRefine((val, ctx) => {
    if (val == null) return;
    if (typeof File !== "undefined" && val instanceof File) {
      assertFileSize(val, ctx);
      return;
    }
    if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof File !== "undefined" && item instanceof File) {
          assertFileSize(item, ctx);
        }
      }
    }
  });
