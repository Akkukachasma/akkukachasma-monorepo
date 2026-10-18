export { default as ProductViewTracker } from "./components/ProductViewTracker";
export { default as ShareProductButton } from "./components/ShareProductButton";
export { useProductViewEffect } from "./hooks/useProductViewEffect";
export {
  recordProductView,
  recordProductShare,
  type RecordProductViewPayload,
} from "./api/popularity.api";
