/** Side-effect CSS imports (plain `tsc` has no bundler CSS pipeline). */
declare module "*.css";

declare module "swiper/css";
declare module "swiper/css/pagination";
declare module "swiper/css/free-mode";
declare module "swiper/css/thumbs";

declare module "react-quill-new/dist/quill.snow.css";
declare module "react-quill-new/dist/quill.bubble.css";

/** Minimal types when package resolution differs across environments. */
declare module "socket.io-client" {
  export interface Socket {
    on(ev: string, fn: (...args: unknown[]) => void): Socket;
    off(ev: string, fn?: (...args: unknown[]) => void): Socket;
    disconnect(): void;
  }
  export function io(uri: string, opts?: Record<string, unknown>): Socket;
}
