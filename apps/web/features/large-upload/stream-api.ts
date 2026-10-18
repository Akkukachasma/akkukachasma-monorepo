import axios, { AxiosError } from "axios";
import { getCookie } from "cookies-next";
import ENDPOINTS from "@/lib/endpoints";
import { TOKENS } from "@/lib/constants";
import { getBaseUrl } from "@/lib/api";

const v1base = `${getBaseUrl()}/v1`;

/** JSON uploads (init/complete/status/cancel): standard JSON client. */
export function createLargeUploadJsonClient() {
  const token = getCookie(TOKENS.AUTH_TOKEN);
  return axios.create({
    baseURL: v1base,
    withCredentials: true,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": "application/json",
    },
  });
}

/** Chunk posts: omit Content-Type so axios sets multipart boundary for FormData. */
export function createLargeUploadChunkClient() {
  const token = getCookie(TOKENS.AUTH_TOKEN);
  return axios.create({
    baseURL: v1base,
    withCredentials: true,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export function parseAxiosApiError(error: unknown): {
  status?: number;
  code?: string;
  message: string;
} {
  const ax = error as AxiosError<{
    message?: string | string[];
    code?: string;
    type?: string;
  }>;
  const status = ax.response?.status;
  const payload = ax.response?.data;
  const rawMsg =
    typeof payload === "object" && payload !== null ? payload.message : null;
  const messageFlat =
    Array.isArray(rawMsg) && rawMsg.length > 0
      ? String(rawMsg[0])
      : rawMsg != null
        ? String(rawMsg)
      : ax.message ??
        "Upload request failed";
  const code =
    typeof payload === "object" &&
    payload !== null &&
    (payload as { code?: string }).code != null
      ? String((payload as { code?: string }).code)
      : undefined;
  return { status, code, message: messageFlat };
}

export async function requestInit(
  api: ReturnType<typeof createLargeUploadJsonClient>,
  body: {
    filename: string;
    mimetype: string;
    totalSize: number;
    totalChunks: number;
  },
) {
  const res = await api.post<{ data?: { uploadId: string; maxChunkBytes: number; expiresAt: string } }>(
    ENDPOINTS.upload_stream.init,
    body,
  );
  return res.data;
}

export async function requestStatus(
  api: ReturnType<typeof createLargeUploadJsonClient>,
  uploadId: string,
) {
  const res = await api.get<{
    data?: {
      uploadChunkIndices?: number[];
      uploadedChunkIndices?: number[];
      uploadedChunks: number;
      totalChunks: number;
      status: string;
      percent: number;
      bytesReceived?: number;
      totalSize?: number;
    };
  }>(ENDPOINTS.upload_stream.status(uploadId));
  return res.data;
}

export async function postChunk(
  api: ReturnType<typeof createLargeUploadChunkClient>,
  params: {
    uploadId: string;
    chunkIndex: number;
    blob: Blob;
  },
) {
  const fd = new FormData();
  fd.append("uploadId", params.uploadId);
  fd.append("chunkIndex", String(params.chunkIndex));
  fd.append("chunk", params.blob, `chunk_${params.chunkIndex}`);
  const res = await api.post(ENDPOINTS.upload_stream.chunk, fd);
  return res.data as {
    data?: { uploadedChunks: number; totalChunks: number; percent: number };
  };
}

export async function requestComplete(
  api: ReturnType<typeof createLargeUploadJsonClient>,
  uploadId: string,
) {
  const res = await api.post<{ data?: Record<string, unknown> }>(
    ENDPOINTS.upload_stream.complete,
    { uploadId },
  );
  return res.data;
}

export async function requestCancel(
  api: ReturnType<typeof createLargeUploadJsonClient>,
  uploadId: string,
) {
  await api.delete(ENDPOINTS.upload_stream.cancel(uploadId));
}
