import { describe, expect, it, vi, afterEach } from "vitest";

vi.mock("cookies-next", () => ({
  getCookie: vi.fn(() => undefined),
}));

const importApi = () => import("./api");

describe("api", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("getBaseUrl uses localhost in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { getBaseUrl } = await importApi();
    expect(getBaseUrl()).toBe("http://localhost:8001");
  });

  it("getBaseUrl uses remote API host when not development", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { getBaseUrl } = await importApi();
    expect(getBaseUrl()).toBe("https://api.akkukachasma.com");
  });

  it("getBaseUrl respects NEXT_PUBLIC_API_URL if provided", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://210.79.129.189");
    const { getBaseUrl } = await importApi();
    expect(getBaseUrl()).toBe("http://210.79.129.189");
  });

  it("getErrorMessage prefers first validation message array entry", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const { getErrorMessage } = await importApi();
    const err = {
      response: {
        data: {
          success: false,
          message: ["First error", "Second"],
        },
      },
      message: "fallback",
    } as unknown as Parameters<typeof getErrorMessage>[0];
    expect(getErrorMessage(err)).toBe("First error");
  });

  it("getErrorMessage uses string message when present", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const { getErrorMessage } = await importApi();
    const err = {
      response: { data: { success: false, message: "Bad input" } },
      message: "Axios message",
    } as unknown as Parameters<typeof getErrorMessage>[0];
    expect(getErrorMessage(err)).toBe("Bad input");
  });

  it("getErrorMessage maps Content Too Large to upload limit copy", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const { getErrorMessage } = await importApi();
    const { uploadLimitExceededMessage } = await import("./upload-limits");
    const err = {
      response: {
        status: 413,
        data: { message: "Content Too Large" },
      },
      message: "Request failed with status code 413",
    } as unknown as Parameters<typeof getErrorMessage>[0];
    expect(getErrorMessage(err)).toBe(uploadLimitExceededMessage());
  });
});
