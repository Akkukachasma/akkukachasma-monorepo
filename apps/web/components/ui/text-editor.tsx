"use client";
import React, { FC } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import "react-quill-new/dist/quill.bubble.css";
import { cn } from "@/lib/utils";
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    if (typeof window !== "undefined") {
      const { default: ImageResize } = await import(
        // @ts-ignore
        "quill-image-resize-module-react"
      );
      RQ.Quill.register("modules/imageResize", ImageResize);
    }
    return RQ;
  },
  { ssr: false },
);

interface TextEditorProps {
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  id?: string;
}

const TextEditor: FC<TextEditorProps> = ({
  value,
  onChange,
  error = "",
  id = "custom-quill-editor",
  placeholder = "Write here...",
}) => {
  const modules = {
    keyboard: { bindings: { tab: false } },
    toolbar: {
      container: [
        [{ size: ["small", false, "large", "huge"] }],
        [
          {
            color: [
              "#000000",
              "#e60000",
              "#ff9900",
              "#ffff00",
              "#008a00",
              "#0066cc",
              "#9933ff",
              "#ffffff",
              "#facccc",
              "#ffebcc",
              "#ffffcc",
              "#cce8cc",
              "#cce0f5",
              "#ebd6ff",
              "#bbbbbb",
              "#f06666",
              "#ffc266",
              "#ffff66",
              "#66b966",
              "#66a3e0",
              "#c285ff",
              "#888888",
              "#a10000",
              "#b26b00",
              "#b2b200",
              "#006100",
              "#0047b2",
              "#6b24b2",
              "#444444",
              "#5c0000",
              "#663d00",
              "#666600",
              "#003700",
              "#002966",
              "#3d1466",
            ],
          },
        ],
        [{ align: "" }, { align: "center" }, { align: "right" }],
        ["bold", "italic", "underline"],
        ["link", "image"],
      ],
    },
    imageResize: {
      parchment: null,
      modules: ["Resize", "DisplaySize"],
      displaySize: true,
      handleStyles: {
        backgroundColor: "black",
        border: "none",
        color: "white",
      },
      toolbarStyles: {
        backgroundColor: "black",
        border: "none",
        color: "white",
      },
    },
  };

  return (
    <div className="w-full h-fit">
      <ReactQuill
        modules={modules}
        formats={formats}
        theme="snow"
        className={cn(`custom-text-editor`, error && "editor-error")}
        placeholder={placeholder}
        style={{
          boxSizing: "border-box",
          padding: 0,
        }}
        value={value}
        onChange={onChange}
        id="custom-quill-editor"
      />
      {error && <small className="text-destructive">{error}</small>}
    </div>
  );
};

const formats = [
  "size",
  "color",
  "align",
  "bold",
  "italic",
  "underline",
  "link",
  "image",
];

export default TextEditor;
