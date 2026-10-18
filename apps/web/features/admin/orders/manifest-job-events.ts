export type ManifestProgressStatus =
  | "attempting"
  | "success"
  | "failed"
  | "skipped";

export type ManifestStartedEvent = {
  type: "started";
  job_id: string;
  total: number;
};

export type ManifestProgressEvent = {
  type: "progress";
  job_id: string;
  order_id: string;
  status: ManifestProgressStatus;
  attempt: number;
  max_attempts: number;
  message?: string;
  waybill_number?: string;
};

export type ManifestCompletedEvent = {
  type: "completed";
  job_id: string;
  counts: { success: number; failed: number; skipped: number };
};

export type ManifestJobEvent =
  | ManifestStartedEvent
  | ManifestProgressEvent
  | ManifestCompletedEvent;

type Listener = (event: ManifestJobEvent) => void;

const listeners = new Set<Listener>();

export function subscribeManifestJob(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function publishManifestJob(event: ManifestJobEvent) {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // ignore listener errors
    }
  }
}
