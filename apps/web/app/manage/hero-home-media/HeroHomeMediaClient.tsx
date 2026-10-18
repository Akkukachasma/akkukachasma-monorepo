"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiClient, getErrorMessage } from "@/lib/api";
import type { RequestError } from "@/lib/api";
import ENDPOINTS from "@/lib/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLargeUpload } from "@/features/large-upload";
import { toast } from "@/lib/hooks/use-toast";
import { heroMediaQueryKey } from "@/features/hero-home-media/queries/useHeroActiveMedia";
import {
  isWithinUploadLimit,
  uploadLimitExceededMessage,
} from "@/lib/upload-limits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HeroMediaFile, HeroMediaType } from "@/features/hero-home-media/types";
import { HeroMediaItem } from "@/components/home/hero-media-item";
import { GripVertical, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type HeroFileRow = {
  id: string;
  key: string;
  type: string | null;
  url: string | null;
  hero_media_sort_order: number | null;
};

type HeroRow = {
  id: string;
  title: string | null;
  is_active: boolean;
  type: HeroMediaType;
  created_at: string | null;
  updated_at: string | null;
  files: HeroFileRow[];
};

type ExistingQueueEntry = {
  queueId: string;
  kind: "existing";
  file: HeroFileRow;
};

type PendingQueueEntry = {
  queueId: string;
  kind: "pending";
  file: File;
};

type QueueEntry = ExistingQueueEntry | PendingQueueEntry;

function sortHeroFiles(files: HeroFileRow[]) {
  return [...files].sort(
    (a, b) => (a.hero_media_sort_order ?? 0) - (b.hero_media_sort_order ?? 0),
  );
}

function toHeroMediaFile(row: HeroFileRow, index: number): HeroMediaFile {
  const mime = row.type ?? "";
  const media_kind = mime.startsWith("image/")
    ? "image"
    : mime.startsWith("video/")
      ? "video"
      : "unknown";

  return {
    id: row.id,
    media_kind,
    mime_type: row.type,
    url: row.url,
    stream_path:
      media_kind === "video"
        ? `/v1/hero-media/files/${row.id}/stream`
        : null,
    sort_order: row.hero_media_sort_order ?? index,
  };
}

function queueLabel(entry: QueueEntry) {
  if (entry.kind === "pending") {
    return entry.file.name;
  }
  const mime = entry.file.type ?? "file";
  return `${mime.split("/")[0] ?? "file"} · ${entry.file.id.slice(-6)}`;
}

export default function HeroHomeMediaClient() {
  const queryClient = useQueryClient();
  const { enqueueLargeUpload, setDialogOpen } = useLargeUpload();
  const [title, setTitle] = React.useState("");
  const [heroType, setHeroType] = React.useState<HeroMediaType>("BANNER");
  const [queue, setQueue] = React.useState<QueueEntry[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const listQuery = useQuery({
    queryKey: ["hero-media", "admin-list"],
    queryFn: async () => {
      const { data } = await getApiClient().get<{ data: HeroRow[] }>(
        ENDPOINTS.hero_media.admin_list,
      );
      return data.data;
    },
  });

  const active = listQuery.data?.find((r) => r.is_active);
  const activeFiles = active?.files ?? [];
  const cacheVersion = active?.updated_at ?? active?.id ?? null;

  /** Keep editor in sync with the live hero, but never drop files the user just added. */
  React.useEffect(() => {
    if (!active) return;

    setHeroType(active.type);
    setTitle(active.title ?? "");

    setQueue((prev) => {
      const pending = prev.filter((e): e is PendingQueueEntry => e.kind === "pending");
      const existing = sortHeroFiles(active.files).map(
        (f): ExistingQueueEntry => ({
          queueId: f.id,
          kind: "existing",
          file: f,
        }),
      );

      if (pending.length > 0) {
        return [...existing, ...pending];
      }
      return existing;
    });
  }, [active?.id, active?.updated_at]);

  const saveMutation = useMutation({
    mutationFn: async (entries: QueueEntry[]) => {
      const hasLiveInList = entries.some((e) => e.kind === "existing");
      const pendingEntries = entries.filter(
        (e): e is PendingQueueEntry => e.kind === "pending",
      );

      const newFileIds: string[] = [];
      for (const entry of pendingEntries) {
        const outcome = await enqueueLargeUpload(entry.file);
        if (!outcome.ok) {
          throw new Error(
            outcome.reason === "cancelled"
              ? "Upload cancelled"
              : outcome.message ?? "Upload failed",
          );
        }
        const fid = outcome.file?.id;
        if (typeof fid !== "string") {
          throw new Error("Missing file id after upload.");
        }
        newFileIds.push(fid);
      }

      if (!hasLiveInList && newFileIds.length === 0 && entries.length === 0) {
        throw new Error("Add at least one file before saving.");
      }

      const { data } = await getApiClient().post(ENDPOINTS.hero_media.activate, {
        file_ids: newFileIds,
        replace_all: !hasLiveInList,
        type: heroType,
        title: title.trim() || undefined,
        delete_previous_file: true,
      });
      return data;
    },
    onSuccess: async () => {
      setDialogOpen(false);
      toast({
        title: "Homepage hero saved",
        description:
          heroType === "SLIDER"
            ? "All files in the list are now in the slider."
            : "The first file in the list is shown as the banner.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: heroMediaQueryKey });
      queryClient.invalidateQueries({ queryKey: ["hero-media", "admin-list"] });
      await listQuery.refetch();
    },
    onError: (e) =>
      toast({
        title: "Could not save hero media",
        description: getErrorMessage(e as RequestError),
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await getApiClient().delete(ENDPOINTS.hero_media.admin_delete(id));
    },
    onSuccess: () => {
      toast({ title: "Removed." });
      setQueue([]);
      queryClient.invalidateQueries({ queryKey: heroMediaQueryKey });
      queryClient.invalidateQueries({ queryKey: ["hero-media", "admin-list"] });
      listQuery.refetch();
    },
    onError: (e) =>
      toast({
        title: "Delete failed",
        description: getErrorMessage(e as RequestError),
        variant: "destructive",
      }),
  });

  const addPendingFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const next: PendingQueueEntry[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file) continue;
      const mime = file.type.toLowerCase();
      if (!mime.startsWith("image/") && !mime.startsWith("video/")) {
        toast({
          title: "Unsupported file",
          description: `${file.name} must be an image or video.`,
          variant: "destructive",
        });
        continue;
      }
      if (!isWithinUploadLimit(file.size)) {
        toast({
          title: "File too large",
          description: `${file.name}: ${uploadLimitExceededMessage()}`,
          variant: "destructive",
        });
        continue;
      }
      next.push({
        queueId: `pending-${file.name}-${file.size}-${Date.now()}-${i}`,
        kind: "pending",
        file,
      });
    }
    if (next.length) {
      setQueue((prev) => [...prev, ...next]);
    }
  };

  const moveQueueItem = (index: number, direction: -1 | 1) => {
    setQueue((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[target]!;
      next[target] = tmp!;
      return next;
    });
  };

  const removeQueueItem = (queueId: string) => {
    setQueue((prev) => prev.filter((e) => e.queueId !== queueId));
  };

  const acceptTypes =
    "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";

  const existingCount = queue.filter((e) => e.kind === "existing").length;
  const pendingCount = queue.filter((e) => e.kind === "pending").length;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Homepage hero media
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build your list, then save once. Live files stay in the list for
          reference; only new uploads are sent to the server, which keeps existing
          hero files automatically unless you remove them from the list.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit &amp; publish</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Add images/videos to the list (multiple allowed for slider).</li>
            <li>Reorder with ↑ ↓ — first file is the banner when type is Banner.</li>
            <li>Choose Banner or Slider, then click Save &amp; publish.</li>
          </ol>

          <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="hero-type">Display type</Label>
              <Select
                value={heroType}
                onValueChange={(v) => setHeroType(v as HeroMediaType)}
              >
                <SelectTrigger id="hero-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANNER">
                    Banner — homepage shows first file only
                  </SelectItem>
                  <SelectItem value="SLIDER">
                    Slider — homepage cycles all files
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hero-title">Title (optional)</Label>
              <Input
                id="hero-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spring 2026 campaign"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Input
              ref={fileInputRef}
              type="file"
              accept={acceptTypes}
              multiple
              className="max-w-md"
              onChange={(e) => {
                addPendingFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <span className="text-xs text-muted-foreground">
              Adds to the list below — does not publish by itself
            </span>
          </div>

          {queue.length > 0 ? (
            <ul className="space-y-2 rounded-md border p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Publish order ({queue.length} file{queue.length === 1 ? "" : "s"}
                {existingCount > 0 && pendingCount > 0
                  ? ` · ${existingCount} live, ${pendingCount} new`
                  : existingCount > 0
                    ? " · all live"
                    : pendingCount > 0
                      ? " · all new"
                      : ""}
                )
              </p>
              {queue.map((entry, index) => (
                <li
                  key={entry.queueId}
                  className="flex items-center gap-2 text-sm"
                >
                  <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">
                    {queueLabel(entry)}
                  </span>
                  <Badge
                    variant={entry.kind === "existing" ? "secondary" : "outline"}
                    className="shrink-0 text-[10px]"
                  >
                    {entry.kind === "existing" ? "Live" : "New"}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={index === 0}
                    onClick={() => moveQueueItem(index, -1)}
                    aria-label="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={index === queue.length - 1}
                    onClick={() => moveQueueItem(index, 1)}
                    aria-label="Move down"
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => removeQueueItem(entry.queueId)}
                    aria-label="Remove from list"
                  >
                    <X className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No files in the list yet. Choose files above to add them.
            </p>
          )}

          <Button
            type="button"
            disabled={saveMutation.isPending || queue.length === 0}
            onClick={() => saveMutation.mutate(queue)}
          >
            {saveMutation.isPending
              ? "Uploading & saving…"
              : `Save & publish (${queue.length} file${queue.length === 1 ? "" : "s"})`}
          </Button>

          {heroType === "BANNER" && queue.length > 1 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Banner mode only shows the first file on the homepage. Use Slider
              to show every file in the list.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Upload progress opens in a dialog and closes automatically when all
            files finish uploading.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live preview</CardTitle>
        </CardHeader>
        <CardContent>
          {active && activeFiles.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Currently live: {active.type} · {activeFiles.length} file
                {activeFiles.length === 1 ? "" : "s"}
              </p>
              <div className="relative aspect-video min-h-48 w-full max-w-3xl overflow-hidden rounded-md border bg-black">
                {active.type === "SLIDER" && activeFiles.length > 1 ? (
                  <div className="absolute inset-0 flex gap-1 overflow-x-auto">
                    {sortHeroFiles(activeFiles).map((f, i) => (
                      <div
                        key={f.id}
                        className="relative h-full min-w-[45%] flex-1"
                      >
                        <HeroMediaItem
                          file={toHeroMediaFile(f, i)}
                          cacheVersion={cacheVersion}
                          title={active.title}
                          isActive={i === 0}
                          priorityImage={i === 0}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <HeroMediaItem
                    file={toHeroMediaFile(sortHeroFiles(activeFiles)[0]!, 0)}
                    cacheVersion={cacheVersion}
                    title={active.title}
                    isActive
                    priorityImage
                  />
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing live yet. Add files and click Save &amp; publish.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {(listQuery.data ?? []).map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
                >
                  <div>
                    <span className="font-medium">
                      {row.title || "Untitled"}{" "}
                      <span className="text-muted-foreground">({row.type})</span>{" "}
                      {row.is_active && (
                        <span className="text-primary">(active)</span>
                      )}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {row.files?.length ?? 0} file(s)
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (
                        confirm(
                          "Delete this entry and remove all files from storage?",
                        )
                      ) {
                        deleteMutation.mutate(row.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}