import Image from "next/image";
import React from "react";
import { twMerge } from "tailwind-merge";

interface FilePreviewProps {
  file: File | null;
  className?: string;
  defaultValue?: {
    url: string;
    type: string;
  };
  children?: React.ReactNode;
  error?: string;
  imagePreviewSize?: {
    width: number;
    height: number;
  };
}

const FilePreview: React.FC<FilePreviewProps> = ({
  className = "",
  error,
  children,
  file,
  defaultValue,
  imagePreviewSize = { width: 200, height: 600 },
}) => {
  return (
    <div
      className={twMerge(
        "relative p-2 w-full h-full rounded-md bg-input text-gray-600 border-2 border-gray-200 cursor-pointer overflow-hidden",
        error && "border-destructive bg-destructive/5",
        className,
        (defaultValue || file) && "p-0",
      )}
    >
      {file && (
        <div className="w-full h-full absolute top-0 left-0">
          {file?.type?.startsWith("image") && (
            <Image
              src={URL.createObjectURL(file)}
              alt="Employee Photo"
              fill
              className="object-contain"
            />
          )}
          {file?.type === "application/pdf" && (
            <div className="bg-[#F8F8F9] absolute w-full h-full top-0 left-0 flex flex-col items-center justify-center">
              <Image src="/fileIcon.png" alt="" width={128} height={128} />
              <p className="text-sm mavenpro-medium">{file?.name}</p>
            </div>
          )}
        </div>
      )}
      {defaultValue && !file && (
        <div className="w-full h-full">
          {defaultValue?.type?.startsWith("image") && defaultValue?.url && (
            <Image
              src={defaultValue?.url}
              alt="Image"
              width={imagePreviewSize.width}
              height={imagePreviewSize.height}
              className="w-full h-full"
            />
          )}
          {defaultValue?.type?.includes("pdf") && (
            <div className="bg-[#F8F8F9] p-4 absolute w-full h-full top-0 left-0 flex flex-col items-center justify-center">
              {/* <MdPictureAsPdf className="text-5xl text-gray-400" /> */}
              <p className="text-sm font-medium w-full line-clamp-1">
                {defaultValue?.url}
              </p>
            </div>
          )}
        </div>
      )}

      {!defaultValue?.url && !file && <>{children}</>}
    </div>
  );
};

export default FilePreview;
