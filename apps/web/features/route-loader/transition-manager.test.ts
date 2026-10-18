import { describe, expect, it, afterEach, vi } from "vitest";
import {
  buildRouteKey,
  buildRouteKeyFromWindow,
  isSameRouteHref,
} from "./transition-manager";

describe("transition-manager", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("buildRouteKey includes query string when present", () => {
    expect(buildRouteKey("/shop", new URLSearchParams("q=1"))).toBe(
      "/shop?q=1",
    );
    expect(buildRouteKey("/shop", new URLSearchParams())).toBe("/shop");
  });

  it("buildRouteKeyFromWindow mirrors pathname + search", () => {
    vi.stubGlobal("window", {
      location: { pathname: "/eyeglasses", search: "?sort=price" },
    } as Window);
    expect(buildRouteKeyFromWindow()).toBe("/eyeglasses?sort=price");
  });

  it("buildRouteKeyFromWindow omits empty search", () => {
    vi.stubGlobal("window", {
      location: { pathname: "/cart", search: "" },
    } as Window);
    expect(buildRouteKeyFromWindow()).toBe("/cart");
  });

  it("isSameRouteHref matches pathname and search", () => {
    const origin = "https://akkukachasma.com";
    expect(isSameRouteHref("/cart", "/cart", origin)).toBe(true);
    expect(isSameRouteHref("/cart?x=1", "/cart?x=1", origin)).toBe(true);
    expect(isSameRouteHref("/cart", "/wishlist", origin)).toBe(false);
  });
});
