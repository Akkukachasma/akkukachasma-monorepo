import { afterEach, describe, expect, it, vi } from "vitest";
import {
  publishManifestJob,
  subscribeManifestJob,
  type ManifestJobEvent,
} from "./manifest-job-events";

describe("manifest-job-events", () => {
  const unsubs: Array<() => void> = [];

  afterEach(() => {
    while (unsubs.length) unsubs.pop()?.();
  });

  it("forwards started / progress / completed payloads to subscribers", () => {
    const received: ManifestJobEvent[] = [];
    unsubs.push(subscribeManifestJob((event) => received.push(event)));

    const started = {
      type: "started" as const,
      job_id: "job-1",
      total: 2,
    };
    const progress = {
      type: "progress" as const,
      job_id: "job-1",
      order_id: "ord-1",
      status: "success" as const,
      attempt: 1,
      max_attempts: 3,
      waybill_number: "WB123",
    };
    const completed = {
      type: "completed" as const,
      job_id: "job-1",
      counts: { success: 1, failed: 0, skipped: 1 },
    };

    publishManifestJob(started);
    publishManifestJob(progress);
    publishManifestJob(completed);

    expect(received).toEqual([started, progress, completed]);
  });

  it("unsubscribe stops further delivery", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeManifestJob(listener);
    unsubs.push(unsubscribe);

    publishManifestJob({ type: "started", job_id: "a", total: 1 });
    unsubscribe();
    publishManifestJob({ type: "started", job_id: "b", total: 1 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      type: "started",
      job_id: "a",
      total: 1,
    });
  });
});
