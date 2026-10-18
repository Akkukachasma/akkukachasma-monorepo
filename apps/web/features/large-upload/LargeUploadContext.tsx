"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  runResumableLargeUpload,
  type LargeUploadOutcome,
  type LargeUploadProgress,
} from "./run-large-upload";
import { LargeUploadDialog } from "./LargeUploadDialog";
import {
  isWithinUploadLimit,
  uploadLimitExceededMessage,
} from "@/lib/upload-limits";
import { toast } from "@/lib/hooks/use-toast";

export type UploadJobRecord = {
  id: string;
  fileLabel: string;
  file: File;
  progress?: LargeUploadProgress;
  outcome?: LargeUploadOutcome;
};

type LargeUploadContextValue = {
  jobs: UploadJobRecord[];
  enqueueLargeUpload: (file: File) => Promise<LargeUploadOutcome>;
  pauseJob: (id: string) => void;
  resumeJob: (id: string) => void;
  cancelJob: (id: string) => void;
  dismissJob: (id: string) => void;
  dialogOpen: boolean;
  setDialogOpen: (v: boolean) => void;
};

const LargeUploadContext = createContext<LargeUploadContextValue | null>(
  null,
);

function makeJob(file: File): UploadJobRecord {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()),
    fileLabel: file.name,
    file,
    progress: {
      phase: "preparing",
      percentApprox: 0,
      uploadedChunks: 0,
      totalChunks: 0,
      bytesUploaded: 0,
      totalBytes: file.size,
    },
  };
}

export function LargeUploadProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [jobs, setJobs] = useState<UploadJobRecord[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const abortByJob = useRef<Record<string, AbortController>>({});
  const pausedByJob = useRef<Record<string, boolean>>({});

  const updateJob = useCallback(
    (id: string, patch: Partial<UploadJobRecord>) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, ...patch } : j)),
      );
    },
    [],
  );

  const enqueueLargeUpload = useCallback(
    async (file: File): Promise<LargeUploadOutcome> => {
      if (!isWithinUploadLimit(file.size)) {
        const message = uploadLimitExceededMessage();
        toast({
          title: "File too large",
          description: message,
          variant: "destructive",
        });
        return { ok: false, reason: "failed", message };
      }

      const job = makeJob(file);
      const abort = new AbortController();
      abortByJob.current[job.id] = abort;
      pausedByJob.current[job.id] = false;

      setJobs((prev) => [...prev, job]);
      setDialogOpen(true);

      console.info("[large-upload]", {
        evt: "enqueue",
        jobId: job.id,
        name: file.name,
        bytes: file.size,
      });

      try {
        const outcome = await runResumableLargeUpload(
          file,
          {
            isPaused: () => pausedByJob.current[job.id] === true,
            concurrency: 3,
            maxRetriesPerChunk: 10,
            onProgress: (p) => updateJob(job.id, { progress: p }),
          },
          abort.signal,
        );

        updateJob(job.id, { outcome });

        console.info("[large-upload]", {
          evt: "job_outcome",
          jobId: job.id,
          ok: outcome.ok,
        });

        return outcome;
      } finally {
        delete abortByJob.current[job.id];
        delete pausedByJob.current[job.id];
      }
    },
    [updateJob],
  );

  const pauseJob = useCallback((id: string) => {
    pausedByJob.current[id] = true;
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== id) return j;
        const base =
          j.progress ?? {
            phase: "preparing" as const,
            percentApprox: 0,
            uploadedChunks: 0,
            totalChunks: 0,
            bytesUploaded: 0,
            totalBytes: j.file.size,
          };
        return { ...j, progress: { ...base, phase: "paused" as const } };
      }),
    );
    console.warn("[large-upload]", { evt: "pause_requested", jobId: id });
  }, []);

  const resumeJob = useCallback((id: string) => {
    pausedByJob.current[id] = false;
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== id) return j;
        const base =
          j.progress ?? {
            phase: "preparing" as const,
            percentApprox: 0,
            uploadedChunks: 0,
            totalChunks: 0,
            bytesUploaded: 0,
            totalBytes: j.file.size,
          };
        return { ...j, progress: { ...base, phase: "uploading" as const } };
      }),
    );
    console.warn("[large-upload]", { evt: "resume_requested", jobId: id });
  }, []);

  const cancelJob = useCallback((id: string) => {
    console.warn("[large-upload]", { evt: "cancel_requested", jobId: id });
    abortByJob.current[id]?.abort();
  }, []);

  const dismissJob = useCallback((id: string) => {
    abortByJob.current[id]?.abort();
    setJobs((prev) => prev.filter((j) => j.id !== id));
    delete pausedByJob.current[id];
    delete abortByJob.current[id];
  }, []);

  /** Auto-close when every job finished successfully (e.g. hero multi-step upload). */
  useEffect(() => {
    if (!dialogOpen || jobs.length === 0) return;

    const allFinished = jobs.every((j) => j.outcome !== undefined);
    const allSucceeded = jobs.every(
      (j) => j.outcome && "ok" in j.outcome && j.outcome.ok === true,
    );

    if (!allFinished || !allSucceeded) return;

    const timer = window.setTimeout(() => {
      setDialogOpen(false);
      setJobs([]);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [jobs, dialogOpen]);

  const value = useMemo<LargeUploadContextValue>(
    () => ({
      jobs,
      enqueueLargeUpload,
      pauseJob,
      resumeJob,
      cancelJob,
      dismissJob,
      dialogOpen,
      setDialogOpen,
    }),
    [
      jobs,
      enqueueLargeUpload,
      pauseJob,
      resumeJob,
      cancelJob,
      dismissJob,
      dialogOpen,
    ],
  );

  return (
    <LargeUploadContext.Provider value={value}>
      {children}
      <LargeUploadDialog
        jobs={jobs}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onPause={pauseJob}
        onResume={resumeJob}
        onCancel={cancelJob}
        onDismiss={dismissJob}
      />
    </LargeUploadContext.Provider>
  );
}

export function useLargeUpload(): LargeUploadContextValue {
  const ctx = useContext(LargeUploadContext);
  if (!ctx) {
    throw new Error(
      "useLargeUpload must be used within LargeUploadProvider",
    );
  }
  return ctx;
}
