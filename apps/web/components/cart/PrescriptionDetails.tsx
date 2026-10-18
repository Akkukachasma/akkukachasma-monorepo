"use client";
import React from "react";
import { IFile } from "@/lib/types";
import Modal from "../ui/modal";
import { Button } from "../ui/button";
import { Expand } from "lucide-react";

export type PrescriptionDisplayData =
  | {
      type: "photo";
      image: string | IFile | { url?: string; id?: string };
      comments?: string;
    }
  | {
      type: "fillup";
      right_sph: string;
      right_cyl: string;
      right_axis: string;
      right_add: string;
      left_sph: string;
      left_cyl: string;
      left_axis: string;
      left_add: string;
      comments?: string;
    };

function prescriptionImageUrl(
  image: string | IFile | { url?: string; id?: string },
): string {
  if (!image) return "";
  if (typeof image === "string") {
    // Hydrated URL or absolute/relative path — bare file ids are not displayable
    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/") ||
      image.startsWith("data:")
    ) {
      return image;
    }
    return "";
  }
  if (typeof image === "object" && typeof image.url === "string") {
    return image.url;
  }
  return "";
}

interface PrescriptionDetailsProps {
  data: PrescriptionDisplayData;
}
const PrescriptionDetails: React.FC<PrescriptionDetailsProps> = ({ data }) => {
  const [expand, setExpand] = React.useState(false);
  if (data.type === "photo") {
    const src = prescriptionImageUrl(data.image);
    if (!src) {
      return (
        <p className="p-3 text-muted-foreground text-xs">
          Prescription photo on file (image unavailable).
        </p>
      );
    }
    return (
      <React.Fragment>
        <Modal open={expand} onOpenChange={setExpand} showCloseIcon>
          {/* Native img for print/html2pdf CORS reliability */}
          <img
            src={src}
            alt="Prescription Image"
            className="w-full h-full object-contain"
          />
        </Modal>
        <div className="w-full h-full relative group">
          <img
            src={src}
            alt="Prescription Image"
            className="w-full h-auto max-h-48 object-contain"
          />
          <div className="absolute hidden inset-0 bg-black bg-opacity-50 text-white p-2 group-hover:grid place-content-center print:hidden">
            <Button
              type="button"
              onClick={() => setExpand(true)}
              title="Click to expand the image"
              variant="ghost"
              className="!text-white hover:bg-black/10"
              size="icon"
            >
              <Expand className="size-4" />
            </Button>
          </div>
        </div>
      </React.Fragment>
    );
  }

  return (
    <table className="min-w-[32rem] w-full text-left text-xs font-light tracking-wide">
      <thead className="border-b font-medium">
        <tr>
          <th scope="col" className="min-w-16 px-3 py-2 sm:px-4">
            #
          </th>
          <th scope="col" className="whitespace-nowrap px-3 py-2 sm:px-4">
            Spherical (SPH)
          </th>
          <th scope="col" className="whitespace-nowrap px-3 py-2 sm:px-4">
            Cylindrical (CYL)
          </th>
          <th scope="col" className="whitespace-nowrap px-3 py-2 sm:px-4">
            Axis
          </th>
          <th scope="col" className="whitespace-nowrap px-3 py-2 sm:px-4">
            Add
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b">
          <td className="whitespace-nowrap px-3 py-2 font-medium sm:px-4">
            RIGHT
          </td>
          <td className="whitespace-nowrap px-3 py-2 sm:px-4">{data.right_sph}</td>
          <td className="whitespace-nowrap px-3 py-2 sm:px-4">{data.right_cyl}</td>
          <td className="whitespace-nowrap px-3 py-2 sm:px-4">{data.right_axis}</td>
          <td className="whitespace-nowrap px-3 py-2 sm:px-4">{data.right_add}</td>
        </tr>
        <tr className="border-b">
          <td className="whitespace-nowrap px-3 py-2 font-medium sm:px-4">
            LEFT
          </td>
          <td className="whitespace-nowrap px-3 py-2 sm:px-4">{data.left_sph}</td>
          <td className="whitespace-nowrap px-3 py-2 sm:px-4">{data.left_cyl}</td>
          <td className="whitespace-nowrap px-3 py-2 sm:px-4">{data.left_axis}</td>
          <td className="whitespace-nowrap px-3 py-2 sm:px-4">{data.left_add}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default PrescriptionDetails;
