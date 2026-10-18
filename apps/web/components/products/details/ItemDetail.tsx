"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FileInput from "@/components/ui/file-input";
import FilePreview from "@/components/ui/file-input/FilePreview";
import DragDropIcon from "@/components/icons/DragDropIcon";
const PRODUCTS = {
  colors: [
    { id: "color_1", color: "#FF0000" }, // Red
    { id: "color_2", color: "#00FF00" }, // Green
    { id: "color_3", color: "#0000FF" }, // Blue
  ],
  images: [
    {
      id: "1014534",
      url: {
        thumbnail: "",
        image_1: "",
        image_2: "",
        image_3: "",
        image_4: "",
      },
      color_id: "color_1",
    },
    {
      id: "10235345",
      url: {
        thumbnail: "",
        image_1: "",
        image_2: "",
        image_3: "",
        image_4: "",
      },
      color_id: "color_2",
    },
    {
      id: "103234234",
      url: {
        thumbnail: "",
        image_1: "",
        image_2: "",
        image_3: "",
        image_4: "",
      },
      color_id: "color_3",
    },
  ],
};

function ItemDetail() {
  const [colorData, setColorData] = useState(
    PRODUCTS?.images?.filter(
      (item) => item.color_id === PRODUCTS?.colors[0]?.id,
    ),
  );

  const [data, setData] = useState<any>(colorData[0].url);

  const handleColor = (colorValue: string) => {
    setColorData(
      PRODUCTS?.images?.filter((items) => items.color_id === colorValue),
    );
  };

  // Handle File Change
  const handleFileChange = (field: string, file: any) => {
    setData((prevData: any) => ({ ...prevData, [field]: file }));
    console.log(data);
  };
  
  return (
    <Card className="flex flex-col gap-6 border-none shadow-none">
      <div className="flex flex-row gap-4 py-4 px-2">
        {PRODUCTS?.colors?.map((items, index) => (
          <Button
            onClick={() => handleColor(items.id)}
            key={index}
            className="w-24 cursor-pointer"
            style={{ backgroundColor: `${items.color}` }}
          ></Button>
        ))}
      </div>

      <div className="w-full grid grid-cols-12 gap-6">
        <div className="flex flex-row gap-6">
          <div>
            <span>
              <FileInput
                value={data.thumbnail}
                onChange={(files) =>
                  files?.[0] && handleFileChange("thumbnail", files[0])
                }
                className="size-56 shadow-md"
              >
                <FilePreview
                  file={data.thumbnail}
                  defaultValue={{
                    type: "image",
                    url: data.thumbnail,
                  }}
                  className="size-full grid place-content-center border-none"
                >
                  <DragDropIcon className="size-[25px]" />
                </FilePreview>
              </FileInput>
            </span>
            <span className="min-w-56 block">Thumbnail</span>
          </div>
          <div>
            <div className="flex flex-row gap-4">
              <FileInput
                value={data.image_1}
                onChange={(files) =>
                  files?.[0] && handleFileChange("image_1", files[0])
                }
                className="size-56 shadow-md"
              >
                <FilePreview
                  file={data.image_1}
                  defaultValue={{
                    type: "image",
                    url: data.image_1,
                  }}
                  className="size-full grid place-content-center border-none"
                >
                  <DragDropIcon className="size-[25px]" />
                </FilePreview>
              </FileInput>
              <FileInput
                value={data.image_2}
                onChange={(files) =>
                  files?.[0] && handleFileChange("image_2", files[0])
                }
                className="size-56 shadow-md"
              >
                <FilePreview
                  file={data.image_2}
                  defaultValue={{
                    type: "image",
                    url: data.image_2,
                  }}
                  className="size-full grid place-content-center border-none"
                >
                  <DragDropIcon className="size-[25px]" />
                </FilePreview>
              </FileInput>
              <FileInput
                value={data.image_3}
                onChange={(files) =>
                  files?.[0] && handleFileChange("image_3", files[0])
                }
                className="size-56 shadow-md"
              >
                <FilePreview
                  file={data.image_3}
                  defaultValue={{
                    type: "image",
                    url: data.image_3,
                  }}
                  className="size-full grid place-content-center border-none"
                >
                  <DragDropIcon className="size-[25px]" />
                </FilePreview>
              </FileInput>
              <FileInput
                value={data.image_4}
                onChange={(files) =>
                  files?.[0] && handleFileChange("image_4", files[0])
                }
                className="size-56 shadow-md"
              >
                <FilePreview
                  file={data.image_4}
                  defaultValue={{
                    type: "image",
                    url: data.image_4,
                  }}
                  className="size-full grid place-content-center border-none"
                >
                  <DragDropIcon className="size-[25px]" />
                </FilePreview>
              </FileInput>
            </div>
            <span className="min-w-56 block">Other Images</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ItemDetail;
