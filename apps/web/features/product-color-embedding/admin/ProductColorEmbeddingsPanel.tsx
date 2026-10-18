"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { getApiClient, getErrorMessage } from "@/lib/api";
import type { RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import type { IProductColorEmbedding } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLargeUpload } from "@/features/large-upload";
import { toast } from "@/lib/hooks/use-toast";
import {
  isWithinUploadLimit,
  uploadLimitExceededMessage,
} from "@/lib/upload-limits";
import ProductEmbeddingRenderer from "../components/ProductEmbeddingRenderer";
import useSessionStorage from "@/hooks/use-session-storage";

const MAX_EMBEDDINGS = 5;

function embeddingsQueryKey(productColorId: string | undefined) {
  return ["product-color-embeddings", productColorId] as const;
}

type ProductColorEmbeddingsPanelProps = {
  product_id: string;
};

export default function ProductColorEmbeddingsPanel({
  product_id,
}: ProductColorEmbeddingsPanelProps) {
  const queryClient = useQueryClient();
  const { enqueueLargeUpload } = useLargeUpload();
  const { value: product_color_id } = useSessionStorage(
    `${product_id}_color_id`,
  );

  const [mode, setMode] = React.useState<"embed" | "video">("embed");
  const [embedCode, setEmbedCode] = React.useState("");
  const [pickedLabel, setPickedLabel] = React.useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: embeddingsQueryKey(product_color_id),
    enabled: Boolean(product_color_id),
    queryFn: async () => {
      const { data } = await getApiClient().get<{
        data: IProductColorEmbedding[];
      }>(
        ENDPOINTS.product_color_embeddings.list_by_product_color(
          product_color_id!,
        ),
      );
      return data.data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: embeddingsQueryKey(product_color_id),
    });
  };

  const createMutation = useMutation({
    mutationFn: async (payload: {
      embed_code?: string;
      file_id?: string;
    }) => {
      const { data } = await getApiClient().post(
        ENDPOINTS.product_color_embeddings.create,
        {
          product_color_id,
          ...payload,
        },
      );
      return data;
    },
    onSuccess: () => {
      toast({ title: "Embedding added." });
      setEmbedCode("");
      setPickedLabel(null);
      invalidate();
    },
    onError: (e) =>
      toast({
        title: "Could not add embedding",
        description: getErrorMessage(e as RequestError),
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await getApiClient().delete(
        ENDPOINTS.product_color_embeddings.delete(id),
      );
    },
    onSuccess: () => {
      toast({ title: "Embedding removed." });
      invalidate();
    },
    onError: (e) =>
      toast({
        title: "Delete failed",
        description: getErrorMessage(e as RequestError),
        variant: "destructive",
      }),
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      await getApiClient().patch(ENDPOINTS.product_color_embeddings.reorder, {
        product_color_id,
        items,
      });
    },
    onSuccess: () => invalidate(),
    onError: (e) =>
      toast({
        title: "Reorder failed",
        description: getErrorMessage(e as RequestError),
        variant: "destructive",
      }),
  });

  const items = listQuery.data ?? [];
  const atLimit = items.length >= MAX_EMBEDDINGS;

  const move = (index: number, direction: -1 | 1) => {
    const next = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const a = next[index];
    const b = next[target];
    reorderMutation.mutate([
      { id: a.id, sort_order: b.sort_order },
      { id: b.id, sort_order: a.sort_order },
    ]);
  };

  const handleCreate = async () => {
    if (!product_color_id) {
      toast({
        title: "Select a product color first.",
        variant: "destructive",
      });
      return;
    }
    if (atLimit) {
      toast({
        title: `Maximum ${MAX_EMBEDDINGS} embeddings per color.`,
        variant: "destructive",
      });
      return;
    }

    if (mode === "embed") {
      if (!embedCode.trim()) {
        toast({ title: "Paste embed code first.", variant: "destructive" });
        return;
      }
      createMutation.mutate({ embed_code: embedCode.trim() });
      return;
    }

    const input = document.getElementById(
      `embedding-video-${product_id}`,
    ) as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      toast({ title: "Choose a video file first.", variant: "destructive" });
      return;
    }
    if (!isWithinUploadLimit(file.size)) {
      toast({
        title: "File too large",
        description: uploadLimitExceededMessage(),
        variant: "destructive",
      });
      return;
    }

    const outcome = await enqueueLargeUpload(file);
    if (!outcome.ok) {
      toast({
        title:
          outcome.reason === "cancelled"
            ? "Upload cancelled"
            : outcome.message ?? "Upload failed",
        variant: "destructive",
      });
      return;
    }
    const fid = outcome.file?.id;
    if (typeof fid !== "string") {
      toast({ title: "Missing file id after upload.", variant: "destructive" });
      return;
    }
    createMutation.mutate({ file_id: fid });
  };

  if (!product_color_id) {
    return (
      <p className="text-sm text-muted-foreground">
        Select a color variant to manage embeddings.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Color embeddings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add up to {MAX_EMBEDDINGS} embeds or streamed videos per color. Shown on
          the product page before related banners.
        </p>
        <p className="text-xs text-muted-foreground">
          {items.length}/{MAX_EMBEDDINGS} used
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "embed" ? "default" : "outline"}
            onClick={() => setMode("embed")}
          >
            Embed code
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "video" ? "default" : "outline"}
            onClick={() => setMode("video")}
          >
            Upload video
          </Button>
        </div>

        {mode === "embed" ? (
          <div className="grid max-w-2xl gap-2">
            <Label htmlFor="embedding-code">Embed code</Label>
            <Textarea
              id="embedding-code"
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
              placeholder="Paste iframe HTML from YouTube, Vimeo, Instagram, Facebook…"
              rows={6}
              className="font-mono text-xs"
              disabled={atLimit || createMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Paste the full embed snippet from the platform (iframe or Instagram
              blockquote). Instagram&apos;s <code className="text-[10px]">embed.js</code>{" "}
              script is stripped automatically; the reel/post is shown via a safe iframe.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Input
              id={`embedding-video-${product_id}`}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="max-w-sm"
              disabled={atLimit || createMutation.isPending}
              onChange={(e) => setPickedLabel(e.target.files?.[0]?.name ?? null)}
            />
            {pickedLabel ? (
              <p className="text-xs text-muted-foreground">Selected: {pickedLabel}</p>
            ) : null}
            <p className="text-xs text-muted-foreground w-full">
              Uses chunked stream upload with HTTP range playback on the storefront.
            </p>
          </div>
        )}

        <Button
          type="button"
          disabled={atLimit || createMutation.isPending}
          onClick={() => void handleCreate()}
        >
          {createMutation.isPending ? "Saving…" : "Add embedding"}
        </Button>

        {listQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading embeddings…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No embeddings yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {[...items]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((emb, index) => (
                <li
                  key={emb.id}
                  className="rounded-lg border border-border p-3 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      {emb.kind === "video" ? "Video" : emb.embed_provider ?? "Embed"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Move up"
                        disabled={index === 0 || reorderMutation.isPending}
                        onClick={() => move(index, -1)}
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Move down"
                        disabled={
                          index === items.length - 1 || reorderMutation.isPending
                        }
                        onClick={() => move(index, 1)}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Delete"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(emb.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <ProductEmbeddingRenderer embedding={emb} active />
                </li>
              ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
