"use client";

import type { UploadJobRecord } from "./LargeUploadContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatMb(bytes: number) {
  if (!Number.isFinite(bytes)) return "–";
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatSpeed(bps?: number | null) {
  if (!bps || !Number.isFinite(bps)) return "–";
  if (bps > 1024 * 1024) return `${(bps / (1024 * 1024)).toFixed(2)} MB/s`;
  if (bps > 1024) return `${(bps / 1024).toFixed(1)} KB/s`;
  return `${bps.toFixed(0)} B/s`;
}

export function LargeUploadDialog(props: {
  jobs: UploadJobRecord[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const { jobs, open, onOpenChange, onPause, onResume, onCancel, onDismiss } =
    props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Large uploads</DialogTitle>
          <DialogDescription>
            Chunked uploads with automatic retries work best when Wi‑Fi is
            unreliable. Pause or resume without leaving your current page.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active uploads.</p>
          ) : (
            jobs.map((job) => {
              const p = job.progress;
              const pct = Math.max(0, Math.min(100, p?.percentApprox ?? 0));
              const outcomeOk =
                job.outcome && "ok" in job.outcome && job.outcome.ok === true;

              const errMsg =
                job.outcome && "ok" in job.outcome && job.outcome.ok === false &&
                job.outcome.reason !== "cancelled"
                  ? job.outcome.message ?? p?.lastError
                  : undefined;

              const canPause =
                p?.phase === "uploading" ||
                p?.phase === "retrying" ||
                p?.phase === "preparing" ||
                p?.phase === "merging";

              const isPausedUi = p?.phase === "paused";

              const isTerminal =
                p?.phase === "completed" ||
                p?.phase === "failed" ||
                p?.phase === "cancelled";

              return (
                <div
                  key={job.id}
                  className="rounded-md border bg-card p-3 text-sm shadow-sm"
                >
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{job.fileLabel}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {(p?.phase ?? "preparing").replace("-", " ")}
                        {typeof p?.retryAttempt === "number" &&
                          p.phase === "retrying" &&
                          ` · retry #${p.retryAttempt}`}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {pct}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-3 grid gap-1 text-[11px] text-muted-foreground md:grid-cols-2">
                    <span>
                      Transferred:{" "}
                      <span className="text-foreground">
                        {formatMb(p?.bytesUploaded ?? 0)} /{" "}
                        {formatMb(p?.totalBytes ?? job.file.size)}
                      </span>
                    </span>
                    <span className="md:text-end">
                      Parts:{" "}
                      <span className="text-foreground">
                        {p?.uploadedChunks ?? 0}/{p?.totalChunks ?? "?"}{" "}
                        · avg {formatSpeed(p?.speedBpsAvg)}
                      </span>
                    </span>
                    <span>
                      ETA:{" "}
                      <span className="text-foreground">
                        {p?.etaSeconds != null && Number.isFinite(p.etaSeconds)
                          ? `${p.etaSeconds}s`
                          : "–"}
                      </span>
                    </span>
                    <span className="md:text-end truncate">
                      {errMsg ? (
                        <span className="text-destructive" title={errMsg}>
                          {errMsg}
                        </span>
                      ) : outcomeOk ? (
                        <span>Completed</span>
                      ) : (
                        " "
                      )}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {!isTerminal && (
                      <>
                        {canPause && !isPausedUi && (
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => onPause(job.id)}
                            className="h-8"
                          >
                            Pause
                          </Button>
                        )}
                        {isPausedUi && (
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => onResume(job.id)}
                            className="h-8"
                          >
                            Resume
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="h-8"
                          onClick={() => onCancel(job.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {(isTerminal || outcomeOk) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        className="h-8"
                        onClick={() => onDismiss(job.id)}
                      >
                        Dismiss
                      </Button>
                    )}
                  </div>

                  {!job.outcome?.ok &&
                    job.outcome &&
                    "reason" in job.outcome &&
                    job.outcome.reason === "cancelled" && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Cancelled locally; aborted session on the API.
                      </p>
                    )}

                  {job.outcome?.ok === true &&
                    typeof (job.outcome.file as { id?: unknown }).id ===
                      "string" && (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        File id{" "}
                        <span className="break-all font-mono text-xs text-foreground">
                          {String((job.outcome.file as { id: string }).id)}
                        </span>
                      </p>
                    )}
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Hide
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={jobs.length === 0}
            onClick={() =>
              [...jobs].forEach((j) => {
                onCancel(j.id);
                onDismiss(j.id);
              })
            }
          >
            Abort &amp; dismiss all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
