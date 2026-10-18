import { describe, expect, it } from "vitest";
import { optionalUploadField, zFile } from "./file";
import { MAX_UPLOAD_BYTES, uploadLimitExceededMessage } from "@/lib/upload-limits";

describe("file validation", () => {
  it("accepts a File within the limit", () => {
    const file = new File([new Uint8Array(100)], "ok.png", {
      type: "image/png",
    });
    expect(zFile.safeParse(file).success).toBe(true);
  });

  it("rejects a File over the limit", () => {
    const big = new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "big.png", {
      type: "image/png",
    });
    const result = zFile.safeParse(big);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        uploadLimitExceededMessage(),
      );
    }
  });

  it("optionalUploadField allows non-File values and checks Files", () => {
    expect(optionalUploadField.safeParse(undefined).success).toBe(true);
    expect(optionalUploadField.safeParse("https://cdn/x.png").success).toBe(
      true,
    );
    const big = new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "big.png");
    expect(optionalUploadField.safeParse(big).success).toBe(false);
  });
});
