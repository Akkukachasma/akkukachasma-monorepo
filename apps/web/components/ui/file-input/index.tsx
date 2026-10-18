import { FC, ReactNode, useCallback } from "react";
import { useDropzone, Accept, FileRejection } from "react-dropzone";
import { twMerge } from "tailwind-merge";
import { Button } from "../button";
import {
  MAX_UPLOAD_BYTES,
  uploadLimitExceededMessage,
} from "@/lib/upload-limits";
import { toast } from "@/lib/hooks/use-toast";

export interface FileInputProps {
  onChange?: (val: File[] | null) => void;
  className?: string;
  children?: ReactNode;
  accept?: Accept;
  error?: string;
  value?: File[];
  multiple?: boolean;
  maxFiles?: number;
  id?: string;
  /** Override default project max upload size (bytes). */
  maxSize?: number;
}

const FileInput: FC<FileInputProps> = ({
  onChange,
  children,
  className,
  accept,
  value,
  error,
  multiple = false,
  maxFiles = 1,
  id,
  maxSize = MAX_UPLOAD_BYTES,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const tooLarge = fileRejections.some((r) =>
          r.errors.some((e) => e.code === "file-too-large"),
        );
        toast({
          title: "File rejected",
          description: tooLarge
            ? uploadLimitExceededMessage()
            : fileRejections[0]?.errors[0]?.message ?? "Invalid file",
          variant: "destructive",
        });
      }
      if (acceptedFiles.length > 0 && onChange) {
        onChange(acceptedFiles);
      }
    },
    [onChange],
  );

  const { getInputProps, getRootProps } = useDropzone({
    onDrop,
    multiple,
    maxFiles,
    maxSize,
    ...(accept && { accept }),
  });

  return (
    <div
      {...getRootProps()}
      className={twMerge(
        "w-full relative h-full shadow-lg shadow-input overflow-hidden",
        error && "text-danger",
        className,
      )}
      title="Click or drag and drop to select the file."
    >
      <input {...getInputProps()} id={id} type="file" />
      {children}
      {error && <small className="text-destructive">{error}</small>}
      {Boolean(value?.length) && (
        <Button
          onClick={(event) => {
            if (onChange) onChange(null);
            event.stopPropagation();
          }}
          variant="ghost"
          size="icon"
          className="absolute text-primary-foreground right-0 top-0"
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z"></path>
          </svg>
        </Button>
      )}
    </div>
  );
};

export default FileInput;
